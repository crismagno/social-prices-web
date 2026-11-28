import StoreSitesEnum from "./store-sites.enum";

/** One thing the contact form asks. */
export interface IStoreSiteContactField {
  key: string;
  type: StoreSitesEnum.ContactFieldType;
  /** Its name over the field; empty, the usual one for its kind. */
  label: string | null;
  placeholder: string | null;
  isRequired: boolean;
  /** A choice among options only: what can be chosen. */
  options: string[];
}

/** The send button of the contact form; an empty colour is the site's own. */
export interface IStoreSiteContactButton {
  color: string | null;
  textColor: string | null;
  icon: StoreSitesEnum.FeatureIcon | null;
  iconPosition: StoreSitesEnum.ContactIconPosition;
  size: StoreSitesEnum.ContactButtonSize;
  shape: StoreSitesEnum.ContactButtonShape;
  align: StoreSitesEnum.ContactButtonAlign;
  /** Across the whole width of the box. */
  isFullWidth: boolean;
}

/** The box around the contact form; empty, the template's own. */
export interface IStoreSiteContactBox {
  /** The widest it gets, in pixels; empty, the page's width. */
  width: number | null;
  padding: number | null;
  radius: number | null;
  background: string | null;
  borderColor: string | null;
  isBorderVisible: boolean;
  textColor: string | null;
  /** The colour inside each field. */
  fieldBackground: string | null;
  shadow: StoreSitesEnum.ContactBoxShadow;
}

/**
 * The form of the contact page: what it asks, its words, and where what a
 * visitor writes goes. The e-mail and the webhook are the owner's alone: the
 * published site never receives them.
 */
export interface IStoreSiteContactForm {
  /** The heading over the form; empty, the site's own. */
  title: string | null;
  /** The words of the button; empty, the site's own. */
  buttonLabel: string | null;
  /** What is said once it was sent; empty, the site's own. */
  successMessage: string | null;
  fields: IStoreSiteContactField[];
  destination: StoreSitesEnum.ContactDestination;
  email: string | null;
  /** A number with its country code, digits only. */
  whatsapp: string | null;
  webhookUrl: string | null;
  button: IStoreSiteContactButton;
  box: IStoreSiteContactBox;
}

const Type = StoreSitesEnum.ContactFieldType;

/** The most a visitor may write in a field of each kind, as the API takes it. */
export const CONTACT_ANSWER_MAX: Record<
  StoreSitesEnum.ContactFieldType,
  number
> = {
  [Type.NAME]: 80,
  [Type.EMAIL]: 160,
  [Type.PHONE]: 30,
  [Type.TEXT]: 200,
  [Type.TEXTAREA]: 2000,
  [Type.SELECT]: 60,
};

/** Sizes the API cuts the words of the form to: the editor stops there too. */
export const CONTACT_LIMITS = {
  title: 80,
  buttonLabel: 30,
  successMessage: 200,
  label: 60,
  placeholder: 80,
  option: 60,
  email: 160,
  webhookUrl: 500,
} as const;

const field = (
  key: string,
  type: StoreSitesEnum.ContactFieldType,
  isRequired: boolean,
): IStoreSiteContactField => ({
  key,
  type,
  label: null,
  placeholder: null,
  isRequired,
  options: [],
});

/** The form every contact page had before it could be changed. */
const usualFields = (): IStoreSiteContactField[] => [
  field("contact-name", Type.NAME, true),
  field("contact-email", Type.EMAIL, true),
  field("contact-phone", Type.PHONE, false),
  field("contact-message", Type.TEXTAREA, true),
];

/** A new field of the form, with a key of its own. */
export const newContactField = (
  type: StoreSitesEnum.ContactFieldType = Type.TEXT,
): IStoreSiteContactField =>
  field(
    `f-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    type,
    false,
  );

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const colorOf = (value: unknown): string | null =>
  typeof value === "string" && HEX_COLOR.test(value) ? value : null;

const oneOf = <T extends string>(
  value: unknown,
  options: T[],
  fallback: T,
): T => (options.includes(value as T) ? (value as T) : fallback);

const pixelsOf = (
  value: unknown,
  limits: { min: number; max: number },
): number | null =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(limits.max, Math.max(limits.min, Math.round(value)))
    : null;

/** The send button, also for a form saved before it could be styled. */
export const contactButtonOf = (
  button: Partial<IStoreSiteContactButton> | null | undefined,
): IStoreSiteContactButton => ({
  color: colorOf(button?.color),
  textColor: colorOf(button?.textColor),
  icon: Object.values(StoreSitesEnum.FeatureIcon).includes(
    button?.icon as StoreSitesEnum.FeatureIcon,
  )
    ? (button?.icon as StoreSitesEnum.FeatureIcon)
    : null,
  iconPosition: oneOf(
    button?.iconPosition,
    Object.values(StoreSitesEnum.ContactIconPosition),
    StoreSitesEnum.ContactIconPosition.START,
  ),
  size: oneOf(
    button?.size,
    Object.values(StoreSitesEnum.ContactButtonSize),
    StoreSitesEnum.ContactButtonSize.MEDIUM,
  ),
  shape: oneOf(
    button?.shape,
    Object.values(StoreSitesEnum.ContactButtonShape),
    StoreSitesEnum.ContactButtonShape.PILL,
  ),
  align: oneOf(
    button?.align,
    Object.values(StoreSitesEnum.ContactButtonAlign),
    StoreSitesEnum.ContactButtonAlign.START,
  ),
  isFullWidth: button?.isFullWidth === true,
});

/** The box around the form, also for a form saved before it could be styled. */
export const contactBoxOf = (
  box: Partial<IStoreSiteContactBox> | null | undefined,
): IStoreSiteContactBox => {
  const limits = StoreSitesEnum.CONTACT_BOX_LIMITS;

  return {
    width: pixelsOf(box?.width, limits.width),
    padding: pixelsOf(box?.padding, limits.padding),
    radius: pixelsOf(box?.radius, limits.radius),
    background: colorOf(box?.background),
    borderColor: colorOf(box?.borderColor),
    isBorderVisible: box?.isBorderVisible !== false,
    textColor: colorOf(box?.textColor),
    fieldBackground: colorOf(box?.fieldBackground),
    shadow: oneOf(
      box?.shadow,
      Object.values(StoreSitesEnum.ContactBoxShadow),
      StoreSitesEnum.ContactBoxShadow.NONE,
    ),
  };
};

/**
 * The form of the contact page, whatever was stored. One saved before it
 * could be changed asks what it always asked and goes to the store's inbox.
 * The API checks everything else when saving.
 */
export const siteContactFormOf = (
  form: Partial<IStoreSiteContactForm> | null | undefined,
): IStoreSiteContactForm => {
  const fields: IStoreSiteContactField[] = (
    Array.isArray(form?.fields) ? (form?.fields ?? []) : []
  )
    .filter(
      (asked: IStoreSiteContactField) =>
        !!asked && Object.values(Type).includes(asked.type),
    )
    .map((asked: IStoreSiteContactField) => ({
      key: asked.key,
      type: asked.type,
      label: asked.label ?? null,
      placeholder: asked.placeholder ?? null,
      isRequired: asked.isRequired === true,
      options: Array.isArray(asked.options) ? asked.options : [],
    }));

  return {
    title: form?.title ?? null,
    buttonLabel: form?.buttonLabel ?? null,
    successMessage: form?.successMessage ?? null,
    fields: fields.length ? fields : usualFields(),
    destination: Object.values(StoreSitesEnum.ContactDestination).includes(
      form?.destination as StoreSitesEnum.ContactDestination,
    )
      ? (form?.destination as StoreSitesEnum.ContactDestination)
      : StoreSitesEnum.ContactDestination.INBOX,
    email: form?.email ?? null,
    whatsapp: form?.whatsapp ?? null,
    webhookUrl: form?.webhookUrl ?? null,
    button: contactButtonOf(form?.button),
    box: contactBoxOf(form?.box),
  };
};

/** What the form of the contact page sends: each answer by the key of its field. */
export interface ISiteContactAnswers {
  answers: Record<string, string>;
  /** A form section (or "<section>/<element>" on a canvas); none, the contact page's. */
  formKey?: string;
}

/** Between the key of a canvas section and the key of the form on it. */
export const FORM_KEY_SEPARATOR: string = "/";
