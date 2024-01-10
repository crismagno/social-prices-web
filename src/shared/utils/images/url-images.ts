import UsersServiceEnum from "../../../services/social-prices-api/users/users-service.enum";

export const getAvatarImageLocalUrl = (filename: string): string =>
  `${process.env.NEXT_PUBLIC_SOCIAL_PRICES_API_URL_V1}${UsersServiceEnum.Methods.GET_AVATAR_IMAGE}/${filename}`;

export const getImageAwsS3 = (filename: string): string =>
  `${process.env.NEXT_PUBLIC_BUCKET_SOCIAL_PRICES_AWS_S3}/${filename}`;
