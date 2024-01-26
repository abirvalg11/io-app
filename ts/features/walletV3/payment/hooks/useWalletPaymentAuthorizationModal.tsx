import * as pot from "@pagopa/ts-commons/lib/pot";
import * as WebBrowser from "expo-web-browser";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import URLParse from "url-parse";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  WalletPaymentAuthorizePayload,
  walletPaymentAuthorization
} from "../store/actions/networking";
import { walletPaymentAuthorizationUrlSelector } from "../store/selectors";
import {
  WalletPaymentOutcome,
  WalletPaymentOutcomeEnum
} from "../types/PaymentOutcomeEnum";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../common/utils/const";

type Props = {
  onAuthorizationOutcome: (outcome: WalletPaymentOutcome) => void;
  onDismiss: () => void;
};

export type WalletPaymentAuthorizationModal = {
  isLoading: boolean;
  isError: boolean;
  isPendingAuthorization: boolean;
  startPaymentAuthorizaton: (payload: WalletPaymentAuthorizePayload) => void;
};

export const useWalletPaymentAuthorizationModal = ({
  onAuthorizationOutcome,
  onDismiss
}: Props): WalletPaymentAuthorizationModal => {
  const dispatch = useIODispatch();
  const authorizationUrlPot = useIOSelector(
    walletPaymentAuthorizationUrlSelector
  );

  const [isPendingAuthorization, setIsPendingAuthorization] =
    React.useState<boolean>(false);
  const isLoading = pot.isLoading(authorizationUrlPot);
  const isError = pot.isError(authorizationUrlPot);

  const handleAuthorizationResult = React.useCallback(
    (resultUrl: string) => {
      const outcome = pipe(
        new URLParse(resultUrl, true),
        ({ query }) => query.outcome,
        WalletPaymentOutcome.decode,
        E.getOrElse(() => WalletPaymentOutcomeEnum.GENERIC_ERROR)
      );
      onAuthorizationOutcome(outcome);
    },
    [onAuthorizationOutcome]
  );

  React.useEffect(() => {
    if (isPendingAuthorization) {
      return;
    }

    void pipe(
      authorizationUrlPot,
      pot.toOption,
      TE.fromOption(() => undefined),
      TE.chain(url =>
        TE.tryCatch(
          () => {
            setIsPendingAuthorization(true);

            return WebBrowser.openAuthSessionAsync(
              url,
              WALLET_WEBVIEW_OUTCOME_SCHEMA,
              {
                showTitle: false,
                createTask: true,
                showInRecents: true
              }
            );
          },
          () => {
            onDismiss();
            dispatch(walletPaymentAuthorization.cancel());
            setIsPendingAuthorization(false);
          }
        )
      ),
      TE.map(result => {
        if (result.type === "success") {
          handleAuthorizationResult(result.url);
        } else if (result.type === WebBrowser.WebBrowserResultType.DISMISS) {
          dispatch(walletPaymentAuthorization.cancel());
          setIsPendingAuthorization(false);
        }
      })
      // TE.map(handleAuthorizationResult)
    )();
  }, [
    isError,
    isLoading,
    isPendingAuthorization,
    authorizationUrlPot,
    handleAuthorizationResult,
    onDismiss,
    dispatch
  ]);

  React.useEffect(
    () => () => {
      setIsPendingAuthorization(false);
      dispatch(walletPaymentAuthorization.cancel());
    },
    [dispatch]
  );

  const startPaymentAuthorizaton = (payload: WalletPaymentAuthorizePayload) => {
    setIsPendingAuthorization(false);
    dispatch(walletPaymentAuthorization.request(payload));
  };

  return {
    isLoading,
    isError,
    isPendingAuthorization,
    startPaymentAuthorizaton
  };
};
