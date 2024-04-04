import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { WalletStatusEnum } from "../../../../../../definitions/pagopa/walletv3/WalletStatus";
import { Wallets } from "../../../../../../definitions/pagopa/walletv3/Wallets";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { getPaymentsWalletUserMethods } from "../../store/actions";
import { handleGetPaymentsWalletUserMethods } from "../handleGetPaymentsWalletUserMethods";
import { BrandEnum } from "../../../../../../definitions/pagopa/walletv3/WalletInfoDetails";
import { WalletCard } from "../../../../newWallet/types";
import { walletAddCards } from "../../../../newWallet/store/actions/cards";
import { getGenericError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";

describe("handleGetPaymentsWalletUserMethods", () => {
  it(`should put ${getType(getPaymentsWalletUserMethods.success)} and ${getType(
    walletAddCards
  )} when response is success`, () => {
    const T_WALLETID = "1234";
    const T_HPAN = "0001";
    const T_EXPIRE_DATE = new Date(2027, 10, 1);
    const mockGetWalletsByIdUser = jest.fn();
    const getWalletsByIdUserResponse: Wallets = {
      wallets: [
        {
          walletId: T_WALLETID,
          creationDate: new Date(),
          paymentMethodId: "paymentMethodId",
          paymentMethodAsset: "paymentMethodAsset",
          applications: [],
          status: WalletStatusEnum.CREATED,
          updateDate: new Date(),
          details: {
            type: "CREDITCARD",
            lastFourDigits: T_HPAN,
            expiryDate: T_EXPIRE_DATE,
            brand: BrandEnum.VISA
          }
        }
      ]
    };
    const cards: ReadonlyArray<WalletCard> = [
      {
        key: `method_${T_WALLETID}`,
        type: "payment",
        category: "payment",
        walletId: T_WALLETID,
        hpan: T_HPAN,
        brand: BrandEnum.VISA,
        expireDate: T_EXPIRE_DATE,
        abiCode: undefined,
        holderEmail: undefined,
        holderPhone: undefined
      }
    ];

    testSaga(
      handleGetPaymentsWalletUserMethods,
      mockGetWalletsByIdUser,
      getPaymentsWalletUserMethods.request()
    )
      .next()
      .call(
        withRefreshApiCall,
        mockGetWalletsByIdUser(),
        getPaymentsWalletUserMethods.request()
      )
      .next(E.right({ status: 200, value: getWalletsByIdUserResponse }))
      .put(walletAddCards(cards))
      .next()
      .put(getPaymentsWalletUserMethods.success(getWalletsByIdUserResponse))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getPaymentsWalletUserMethods.failure
  )} when response is not success`, () => {
    const mockGetWalletsByIdUser = jest.fn();

    testSaga(
      handleGetPaymentsWalletUserMethods,
      mockGetWalletsByIdUser,
      getPaymentsWalletUserMethods.request()
    )
      .next()
      .call(
        withRefreshApiCall,
        mockGetWalletsByIdUser(),
        getPaymentsWalletUserMethods.request()
      )
      .next(E.right({ status: 400, value: undefined }))
      .put(
        getPaymentsWalletUserMethods.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getPaymentsWalletUserMethods.failure
  )} when getWalletsByIdUser encoders returns an error`, () => {
    const mockGetWalletsByIdUser = jest.fn();

    testSaga(
      handleGetPaymentsWalletUserMethods,
      mockGetWalletsByIdUser,
      getPaymentsWalletUserMethods.request()
    )
      .next()
      .call(
        withRefreshApiCall,
        mockGetWalletsByIdUser(),
        getPaymentsWalletUserMethods.request()
      )
      .next(E.left([]))
      .put(
        getPaymentsWalletUserMethods.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
