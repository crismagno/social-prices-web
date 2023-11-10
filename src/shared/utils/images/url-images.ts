import UsersServiceEnum from "../../../services/social-prices-api/users/user-service.enum";

export const getAvatarImageLocalUrl = (filename: string): string =>
  `${process.env.NEXT_PUBLIC_SOCIAL_PRICES_API_URL_V1}${UsersServiceEnum.Methods.GET_AVATAR_IMAGE}/${filename}`;
