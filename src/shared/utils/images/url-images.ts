export const getImageLocalUrl = (filename: string): string =>
  `${process.env.NEXT_PUBLIC_SOCIAL_PRICES_API_URL_V1}/uploads/${filename}`;

export const getImageAwsUrl = (filename: string): string =>
  `${process.env.NEXT_PUBLIC_BUCKET_SOCIAL_PRICES_AWS_S3}/${filename}`;

export const getImageUrl = (filename: string): string => {
  const apiUseLocalFiles: boolean =
    `${process.env.NEXT_PUBLIC_SOCIAL_PRICES_API_USE_LOCAL_FILES}` === "true";

  if (apiUseLocalFiles) {
    return getImageLocalUrl(filename);
  }

  return getImageAwsUrl(filename);
};
