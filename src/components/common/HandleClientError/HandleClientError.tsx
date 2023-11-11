import { message } from "antd";

const handleClientError = (
  error: any,
  duration: number = 2,
  onClose?: VoidFunction | undefined
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

  message.error(messageError, duration, onClose);

  return messageError;
};

export default handleClientError;
