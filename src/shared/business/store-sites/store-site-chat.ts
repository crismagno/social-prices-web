import StoreSitesEnum from "./store-sites.enum";

/**
 * The chat of the site: a button that opens a conversation with the store,
 * which answers it in its inbox. The visitor gives a name (always) and an
 * email and a phone as the owner asks.
 */
export interface IStoreSiteChat {
  isActive: boolean;
  position: StoreSitesEnum.ChatPosition;
  /** The ready icon of the button. */
  icon: StoreSitesEnum.ChatIcon;
  /** What the button says; empty, the site says its own. */
  buttonLabel: string | null;
  /** The title of the chat window; empty, the name of the site. */
  title: string | null;
  /** The first words the visitor reads. */
  greeting: string | null;
  emailField: StoreSitesEnum.ChatFieldMode;
  phoneField: StoreSitesEnum.ChatFieldMode;
}

/** One message as the visitor sees it. */
export interface ISiteChatMessage {
  id: string;
  fromStore: boolean;
  text: string | null;
  sentAt: string;
}

export interface ISiteChatVisitor {
  name: string;
  email: string | null;
  phone: string | null;
}

/** The chat of a site, also for one saved before it existed: off. */
export const siteChatOf = (
  chat: Partial<IStoreSiteChat> | null | undefined,
): IStoreSiteChat => ({
  isActive: chat?.isActive === true,
  position:
    chat?.position === StoreSitesEnum.ChatPosition.LEFT
      ? StoreSitesEnum.ChatPosition.LEFT
      : StoreSitesEnum.ChatPosition.RIGHT,
  icon: Object.values(StoreSitesEnum.ChatIcon).includes(
    chat?.icon as StoreSitesEnum.ChatIcon,
  )
    ? (chat?.icon as StoreSitesEnum.ChatIcon)
    : StoreSitesEnum.ChatIcon.MESSAGE,
  buttonLabel: chat?.buttonLabel?.trim() || null,
  title: chat?.title?.trim() || null,
  greeting: chat?.greeting?.trim() || null,
  emailField: Object.values(StoreSitesEnum.ChatFieldMode).includes(
    chat?.emailField as StoreSitesEnum.ChatFieldMode,
  )
    ? (chat?.emailField as StoreSitesEnum.ChatFieldMode)
    : StoreSitesEnum.ChatFieldMode.REQUIRED,
  phoneField: Object.values(StoreSitesEnum.ChatFieldMode).includes(
    chat?.phoneField as StoreSitesEnum.ChatFieldMode,
  )
    ? (chat?.phoneField as StoreSitesEnum.ChatFieldMode)
    : StoreSitesEnum.ChatFieldMode.OPTIONAL,
});
