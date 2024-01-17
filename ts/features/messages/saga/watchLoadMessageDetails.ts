import { put, takeLatest, call } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";

import { CreatedMessageWithContentAndAttachments } from "../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { BackendClient } from "../../../api/backend";
import { loadMessageDetails } from "../store/actions";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils";
import { getError } from "../../../utils/errors";
import { toUIMessageDetails } from "../store/reducers/transformers";
import { isTestEnv } from "../../../utils/environment";
import { withRefreshApiCall } from "../../fastLogin/saga/utils";
import { errorToReason, unknownToReason } from "../utils";
import { trackLoadMessageDetailsFailure } from "../analytics";
import { handleResponse } from "../utils/responseHandling";

type LocalActionType = ActionType<(typeof loadMessageDetails)["request"]>;
type LocalBeClient = ReturnType<typeof BackendClient>["getMessage"];

export default function* watcher(
  getMessage: LocalBeClient
): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof getMessage>> {
  yield* takeLatest(
    getType(loadMessageDetails.request),
    tryLoadMessageDetails(getMessage)
  );
}

/**
 * A saga to fetch a message from the Backend and save it in the redux store.
 *
 * @param getMessage
 */
function tryLoadMessageDetails(getMessage: LocalBeClient) {
  return function* gen(
    action: LocalActionType
  ): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof getMessage>> {
    const id = action.payload.id;
    try {
      const response = (yield* call(
        withRefreshApiCall,
        getMessage({ id }),
        action
      )) as unknown as SagaCallReturnType<typeof getMessage>;
      const nextAction =
        handleResponse<CreatedMessageWithContentAndAttachments>(
          response,
          (message: CreatedMessageWithContentAndAttachments) =>
            loadMessageDetails.success(toUIMessageDetails(message)),
          error => {
            const reason = errorToReason(error);
            trackLoadMessageDetailsFailure(reason);
            return loadMessageDetails.failure({
              id,
              error: getError(error)
            });
          }
        );

      if (nextAction) {
        yield* put(nextAction);
      }
    } catch (error) {
      const reason = unknownToReason(error);
      trackLoadMessageDetailsFailure(reason);
      yield* put(
        loadMessageDetails.failure({
          id,
          error: getError(error)
        })
      );
    }
  };
}

export const testTryLoadMessageDetails = isTestEnv
  ? tryLoadMessageDetails
  : undefined;