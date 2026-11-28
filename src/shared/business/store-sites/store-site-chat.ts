import StoreSitesEnum from "./store-sites.enum";

/**
 * The chat of the site: a button that opens a conversation with the store,
 * which answers it in its inbox. The visitor gives a name (always) and the
 * customer fields the owner lists, email and phone among them.
 */
export interface IStoreSiteChat {
  isActive: boolean;
  position: StoreSitesEnum.ChatPosition;
  /** The ready icon of the button. */
  icon: StoreSitesEnum.ChatIcon;
  /** How big the button in the corner is. */
  buttonSize: StoreSitesEnum.ChatSize;
  /** How big the conversation window is. */
  windowSize: StoreSitesEnum.ChatSize;
  /** How the closed button calls for attention. */
  buttonAnimation: StoreSitesEnum.ChatButtonAnimation;
  /** How the window opens. */
  windowAnimation: StoreSitesEnum.ChatWindowAnimation;
  /** What the button says; empty, the site says its own. */
  buttonLabel: string | null;
  /** The title of the chat window; empty, the name of the site. */
  title: string | null;
  /** The first words the visitor reads. */
  greeting: string | null;
  /** How the email is asked, read from `extraFields`. */
  emailField: StoreSitesEnum.ChatFieldMode;
  /** How the phone is asked, read from `extraFields`. */
  phoneField: StoreSitesEnum.ChatFieldMode;
  /** Minutes a chat stays the visitor's after they last wrote; then they start again. */
  sessionMinutes: number;
  /** The fields asked after the name, email and phone among them, in order. */
  extraFields: ISiteChatExtraField[];
  /** 2 once email and phone live in `extraFields`. */
  fieldsVersion: number;
  /** Its own colours; an empty one is the site's. */
  colors: IStoreSiteChatColors;
}

/** The colours of the chat alone; an empty one is the site's. */
export interface IStoreSiteChatColors {
  /** The button, the top of the window and the visitor's messages. */
  primary: string | null;
  /** The background of the window. */
  background: string | null;
  /** The words in the window. */
  text: string | null;
}

const HEX_COLOR: RegExp = /^#[0-9a-fA-F]{6}$/;

const hexOf = (value: unknown): string | null =>
  typeof value === "string" && HEX_COLOR.test(value) ? value : null;

/** A field of the customer record the owner asks in the chat's form. */
export interface ISiteChatExtraField {
  field: StoreSitesEnum.ChatCustomerField;
  isRequired: boolean;
}

/** Every customer field can be asked once. */
export const CHAT_EXTRA_FIELDS_MAX: number = Object.values(
  StoreSitesEnum.ChatCustomerField,
).length;

export const SESSION_MINUTES_LIMITS = {
  min: 5,
  max: 24 * 60,
  initial: 60,
} as const;

/** The largest file or recording the chat takes, as the API says. */
export const SITE_CHAT_MAX_UPLOAD_BYTES: number = 16 * 1024 * 1024;

/** A file of a message as the visitor sees it; its bytes are fetched apart. */
export interface ISiteChatAttachment {
  /** The inbox's kind: IMAGE, VIDEO, AUDIO, VOICE, FILE... */
  kind: string;
  mimeType: string | null;
  fileName: string | null;
  size: number | null;
}

/** One message as the visitor sees it. */
export interface ISiteChatMessage {
  id: string;
  fromStore: boolean;
  kind?: string;
  text: string | null;
  attachments?: ISiteChatAttachment[];
  sentAt: string;
  /** When its words were last changed; null when they never were. */
  editedAt?: string | null;
}

export interface ISiteChatVisitor {
  name: string;
  email: string | null;
  phone: string | null;
  /** The answers to the owner's own fields, by the key of each field. */
  answers?: Record<string, string>;
}

const FIELDS_VERSION = 2;

const Mode = StoreSitesEnum.ChatFieldMode;
const Customer = StoreSitesEnum.ChatCustomerField;

const modeOf = (
  value: unknown,
  fallback: StoreSitesEnum.ChatFieldMode,
): StoreSitesEnum.ChatFieldMode =>
  Object.values(Mode).includes(value as StoreSitesEnum.ChatFieldMode)
    ? (value as StoreSitesEnum.ChatFieldMode)
    : fallback;

/** Known customer fields only, each once, in the owner's order. */
const knownFieldsOf = (fields: unknown): ISiteChatExtraField[] =>
  (Array.isArray(fields) ? (fields as Partial<ISiteChatExtraField>[]) : [])
    .filter(
      (field, index, all) =>
        Object.values(Customer).includes(
          field?.field as StoreSitesEnum.ChatCustomerField,
        ) && all.findIndex((other) => other?.field === field.field) === index,
    )
    .map((field) => ({
      field: field.field as StoreSitesEnum.ChatCustomerField,
      isRequired: field.isRequired === true,
    }));

/** An older chat asked email and phone by modes; they go first in its list. */
const fieldsOf = (
  chat: Partial<IStoreSiteChat> | null | undefined,
): ISiteChatExtraField[] => {
  if (chat?.fieldsVersion === FIELDS_VERSION) {
    return knownFieldsOf(chat.extraFields);
  }

  const email = modeOf(chat?.emailField, Mode.REQUIRED);
  const phone = modeOf(chat?.phoneField, Mode.OPTIONAL);

  return [
    ...(email === Mode.HIDDEN
      ? []
      : [{ field: Customer.EMAIL, isRequired: email === Mode.REQUIRED }]),
    ...(phone === Mode.HIDDEN
      ? []
      : [{ field: Customer.PHONE, isRequired: phone === Mode.REQUIRED }]),
    ...knownFieldsOf(chat?.extraFields).filter(
      ({ field }) => field !== Customer.EMAIL && field !== Customer.PHONE,
    ),
  ];
};

/** How a field of the list is asked; not in it, it is not asked. */
export const chatFieldModeOf = (
  fields: ISiteChatExtraField[],
  wanted: StoreSitesEnum.ChatCustomerField,
): StoreSitesEnum.ChatFieldMode => {
  const found = fields.find(({ field }) => field === wanted);

  if (!found) {
    return Mode.HIDDEN;
  }

  return found.isRequired ? Mode.REQUIRED : Mode.OPTIONAL;
};

const oneOf = <T extends string>(
  value: unknown,
  options: T[],
  fallback: T,
): T => (options.includes(value as T) ? (value as T) : fallback);

/** The chat of a site, also for one saved before it existed: off. */
export const siteChatOf = (
  chat: Partial<IStoreSiteChat> | null | undefined,
): IStoreSiteChat => {
  const extraFields = fieldsOf(chat);

  return {
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
    buttonSize: oneOf(
      chat?.buttonSize,
      Object.values(StoreSitesEnum.ChatSize),
      StoreSitesEnum.ChatSize.MEDIUM,
    ),
    windowSize: oneOf(
      chat?.windowSize,
      Object.values(StoreSitesEnum.ChatSize),
      StoreSitesEnum.ChatSize.MEDIUM,
    ),
    buttonAnimation: oneOf(
      chat?.buttonAnimation,
      Object.values(StoreSitesEnum.ChatButtonAnimation),
      StoreSitesEnum.ChatButtonAnimation.BOB,
    ),
    windowAnimation: oneOf(
      chat?.windowAnimation,
      Object.values(StoreSitesEnum.ChatWindowAnimation),
      StoreSitesEnum.ChatWindowAnimation.POP,
    ),
    buttonLabel: chat?.buttonLabel?.trim() || null,
    title: chat?.title?.trim() || null,
    greeting: chat?.greeting?.trim() || null,
    emailField: chatFieldModeOf(extraFields, Customer.EMAIL),
    phoneField: chatFieldModeOf(extraFields, Customer.PHONE),
    sessionMinutes:
      typeof chat?.sessionMinutes === "number" &&
      Number.isFinite(chat.sessionMinutes)
        ? Math.min(
            SESSION_MINUTES_LIMITS.max,
            Math.max(
              SESSION_MINUTES_LIMITS.min,
              Math.round(chat.sessionMinutes),
            ),
          )
        : SESSION_MINUTES_LIMITS.initial,
    extraFields,
    fieldsVersion: FIELDS_VERSION,
    colors: {
      primary: hexOf(chat?.colors?.primary),
      background: hexOf(chat?.colors?.background),
      text: hexOf(chat?.colors?.text),
    },
  };
};
