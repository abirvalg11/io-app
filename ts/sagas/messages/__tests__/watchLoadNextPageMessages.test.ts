import { right } from "fp-ts/lib/Either";
import { getType } from "typesafe-actions";
import { testSaga } from "redux-saga-test-plan";

import { loadNextPageMessages as action } from "../../../store/actions/messages";
import { testTryLoadNextPageMessages } from "../watchLoadNextPageMessages";
import {
  apiPayload,
  successLoadNextPageMessagesPayload
} from "../../../__mocks__/messages";

const tryLoadNextPageMessages = testTryLoadNextPageMessages!;

const defaultPageSize = 8;

describe("tryLoadNextPageMessages", () => {
  const getMessagesPayload = {
    enrich_result_data: true,
    page_size: defaultPageSize,
    maximum_id: undefined
  };

  describe("when the response is successful", () => {
    it(`should put ${getType(
      action.success
    )} with the parsed messages and pagination data`, () => {
      const getMessages = jest.fn();
      testSaga(
        tryLoadNextPageMessages(getMessages),
        action.request({ pageSize: defaultPageSize })
      )
        .next()
        .call(getMessages, getMessagesPayload)
        .next(right({ status: 200, value: apiPayload }))
        .put(action.success(successLoadNextPageMessagesPayload))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    it(`should put ${getType(action.failure)} with the error message`, () => {
      const getMessages = jest.fn();
      testSaga(
        tryLoadNextPageMessages(getMessages),
        action.request({ pageSize: defaultPageSize })
      )
        .next()
        .call(getMessages, getMessagesPayload)
        .next(right({ status: 500, value: { title: "Backend error" } }))
        .put(action.failure(Error("Backend error")))
        .next()
        .isDone();
    });
  });

  describe("when the handler throws", () => {
    it(`should catch it and put ${getType(action.failure)}`, () => {
      const getMessages = () => {
        throw new Error("I made a boo-boo, sir!");
      };
      testSaga(
        tryLoadNextPageMessages(getMessages),
        action.request({ pageSize: defaultPageSize })
      )
        .next()
        .call(getMessages, getMessagesPayload)
        .next()
        .put(
          action.failure(TypeError("Cannot read property 'fold' of undefined"))
        )
        .next()
        .isDone();
    });
  });
});
