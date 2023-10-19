import { message } from "antd";

const handleClientError = (
  error: any,
  duration: number = 2,
  onClose?: VoidFunction | undefined
): string => {
  const errorResponse = error?.response;

  const errorResponseData = errorResponse?.data;

  const errorResponseDataError = errorResponseData?.error;
  let messageError: string = "Error!";

  if (errorResponseDataError?.messageError) {
    messageError = errorResponseDataError?.messageError;
  } else if (errorResponseDataError?.error) {
    messageError = errorResponseDataError?.error;
  } else if (typeof error === "string") {
    messageError = error;
  }

  message.error(messageError, duration, onClose);

  return messageError;
};

export default handleClientError;
