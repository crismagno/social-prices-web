"use client";

import { message as staticMessage } from "antd";
import { MessageInstance } from "antd/es/message/interface";

let _messageApi: MessageInstance | null = null;

export const setHandleClientErrorMessageApi = (api: MessageInstance): void => {
  _messageApi = api;
};

const handleClientError = (
  error: any,
  duration: number = 2,
  onClose?: VoidFunction | undefined,
): string => {
  let messageError: string = error?.message ?? "Error!";

  const errorResponseData = error?.response?.data;

  const errorResponseDataError = errorResponseData?.error;

  if (errorResponseDataError?.message) {
    messageError = errorResponseDataError?.message;
  } else if (errorResponseDataError?.error) {
    messageError = errorResponseDataError?.error;
  } else if (typeof error === "string") {
    messageError = error;
  }

  const api = _messageApi ?? staticMessage;
  api.error(messageError, duration, onClose);

  return messageError;
};

export default handleClientError;
