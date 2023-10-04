const handleClientError = (error: any): string => {
  const errorResponse = error?.response;

  const errorResponseData = errorResponse?.data;

  const errorResponseDataError = errorResponseData?.error;
  let message: string = "Error!";

  if (errorResponseDataError?.message) {
    message = errorResponseDataError?.message;
  } else if (errorResponseDataError?.error) {
    message = errorResponseDataError?.error;
  }

  return message;
};

export default handleClientError;
