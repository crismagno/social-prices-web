import Urls from "../../common/routes-app/routes-app";
import StoreSitesEnum from "./store-sites.enum";

/** The sign-in button at the top of the site. */
export interface IStoreSiteSignIn {
  isVisible: boolean;
  /** What the button says; empty, the site says "Sign in". */
  label: string | null;
  destination: StoreSitesEnum.SignInDestination;
}

/** The button of a site, also for one saved before it existed. */
export const siteSignInOf = (
  signIn: Partial<IStoreSiteSignIn> | null | undefined,
): IStoreSiteSignIn => ({
  isVisible: signIn?.isVisible !== false,
  label: signIn?.label?.trim() || null,
  destination: Object.values(StoreSitesEnum.SignInDestination).includes(
    signIn?.destination as StoreSitesEnum.SignInDestination,
  )
    ? (signIn?.destination as StoreSitesEnum.SignInDestination)
    : StoreSitesEnum.SignInDestination.STORE_CHAT,
});

/**
 * Where in the customer's account the button leads. Without the store (the
 * editor's preview), the conversation falls back to the list of them.
 */
export const signInDestinationPath = (
  destination: StoreSitesEnum.SignInDestination,
  storeId: string | null | undefined,
): string => {
  switch (destination) {
    case StoreSitesEnum.SignInDestination.ORDERS:
      return Urls.CUSTOMER_PURCHASES;
    case StoreSitesEnum.SignInDestination.HOME:
      return Urls.CUSTOMER_DASHBOARD;
    default:
      return storeId
        ? Urls.CUSTOMER_CHAT_STORE.replace(
            ":storeId",
            encodeURIComponent(storeId),
          )
        : Urls.CUSTOMER_CHATS;
  }
};
