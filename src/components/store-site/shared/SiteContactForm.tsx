"use client";

import { CSSProperties, FormEvent, useState } from "react";

import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import {
  CONTACT_ANSWER_MAX,
  IStoreSiteContactField,
  IStoreSiteContactForm,
  siteContactFormOf,
} from "../../../shared/business/store-sites/store-site-contact";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import FeatureIcon from "./blocks/FeatureIcon";
import { followSiteChat } from "./SiteChatWidget";
import { readableOver } from "./SiteThemeVars";
import styles from "./SitePageBody.module.css";
import useSiteT from "./useSiteT";

interface Props {
  slug: string;
  /** What the owner made of the form; none, the usual one. */
  contact: Partial<IStoreSiteContactForm> | null | undefined;
  /** The editor: the form is there to be seen, and sends nothing. */
  isPreview: boolean;
  /**
   * A form section, or "<section>/<element>" for one on a free canvas: the
   * key the API finds it by. None, the contact page's form.
   */
  formKey?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Type = StoreSitesEnum.ContactFieldType;
const Destination = StoreSitesEnum.ContactDestination;

/** How it went: followed in the chat, answered by e-mail, opened elsewhere. */
type TSent = "chat" | "email" | "whatsapp" | "sent" | null;

// The name of a kind of field when the owner gave it none.
const USUAL_LABEL: Record<StoreSitesEnum.ContactFieldType, string> = {
  [Type.NAME]: "storeSite.contact.name",
  [Type.EMAIL]: "storeSite.contact.email",
  [Type.PHONE]: "storeSite.contact.phone",
  [Type.TEXT]: "storeSite.contact.text",
  [Type.TEXTAREA]: "storeSite.contact.message",
  [Type.SELECT]: "storeSite.contact.choice",
};

// What the browser is told each kind of field is, to fill it by itself.
const INPUT_PROPS: Partial<
  Record<
    StoreSitesEnum.ContactFieldType,
    {
      type?: string;
      inputMode?: "email" | "tel";
      autoComplete?: string;
    }
  >
> = {
  [Type.NAME]: { autoComplete: "name" },
  [Type.EMAIL]: { type: "email", inputMode: "email", autoComplete: "email" },
  [Type.PHONE]: { type: "tel", inputMode: "tel", autoComplete: "tel" },
};

const BUTTON_SIZE_CLASS: Record<StoreSitesEnum.ContactButtonSize, string> = {
  [StoreSitesEnum.ContactButtonSize.SMALL]: styles.contactSendSmall,
  [StoreSitesEnum.ContactButtonSize.MEDIUM]: "",
  [StoreSitesEnum.ContactButtonSize.LARGE]: styles.contactSendLarge,
};

const BUTTON_SHAPE_CLASS: Record<StoreSitesEnum.ContactButtonShape, string> = {
  [StoreSitesEnum.ContactButtonShape.PILL]: "",
  [StoreSitesEnum.ContactButtonShape.ROUNDED]: styles.contactSendRounded,
  [StoreSitesEnum.ContactButtonShape.SQUARE]: styles.contactSendSquare,
};

const BUTTON_ALIGN_CLASS: Record<StoreSitesEnum.ContactButtonAlign, string> = {
  [StoreSitesEnum.ContactButtonAlign.START]: "",
  [StoreSitesEnum.ContactButtonAlign.CENTER]: styles.contactSendCenter,
  [StoreSitesEnum.ContactButtonAlign.END]: styles.contactSendEnd,
};

const BOX_SHADOW_CLASS: Record<StoreSitesEnum.ContactBoxShadow, string> = {
  [StoreSitesEnum.ContactBoxShadow.NONE]: "",
  [StoreSitesEnum.ContactBoxShadow.SOFT]: styles.contactBoxSoft,
  [StoreSitesEnum.ContactBoxShadow.STRONG]: styles.contactBoxStrong,
};

const px = (value: number | null): string | undefined =>
  value === null ? undefined : `${value}px`;

/**
 * The form of the contact page, as the owner made it: what it asks, the
 * words of its button, and where it goes. To the store's inbox it becomes a
 * conversation of the site: where the site has its chat on, the chat window
 * takes it over and the answer shows up there; otherwise the store answers
 * by the e-mail that was given. To an e-mail or to an address of the owner's
 * it is sent and that is all. To WhatsApp it opens the conversation with the
 * answers already written, for the visitor to send.
 */
const SiteContactForm = ({ slug, contact, isPreview, formKey }: Props) => {
  const t = useSiteT();

  const settings: IStoreSiteContactForm = siteContactFormOf(contact);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<TSent>(null);

  const { button, box } = settings;

  // What the owner chose for the box and the button; the rest stays the template's.
  const boxStyle = {
    "--cf-width": px(box.width),
    "--cf-padding": px(box.padding),
    "--cf-radius": px(box.radius),
    "--cf-bg": box.background ?? undefined,
    "--cf-border": box.borderColor ?? undefined,
    "--cf-text": box.textColor ?? undefined,
    "--cf-field-bg": box.fieldBackground ?? undefined,
    "--cf-btn-bg": button.color ?? undefined,
    "--cf-btn-text":
      button.textColor ??
      (button.color ? readableOver(button.color) : undefined),
  } as CSSProperties;

  const boxClassName: string = [
    styles.contactForm,
    box.isBorderVisible ? "" : styles.contactBoxBorderless,
    BOX_SHADOW_CLASS[box.shadow],
  ]
    .filter(Boolean)
    .join(" ");

  const buttonClassName: string = [
    styles.contactSend,
    BUTTON_SIZE_CLASS[button.size],
    BUTTON_SHAPE_CLASS[button.shape],
    button.isFullWidth
      ? styles.contactSendFull
      : BUTTON_ALIGN_CLASS[button.align],
  ]
    .filter(Boolean)
    .join(" ");

  const buttonIcon = button.icon ? (
    <span className={styles.contactSendIcon} aria-hidden>
      <FeatureIcon icon={button.icon} />
    </span>
  ) : null;

  const labelOf = (asked: IStoreSiteContactField): string =>
    asked.label?.trim() || t(USUAL_LABEL[asked.type]);

  const valueOf = (asked: IStoreSiteContactField): string =>
    (answers[asked.key] ?? "").trim();

  const set =
    (key: string) =>
    (event: { target: { value: string } }): void =>
      setAnswers((current) => ({ ...current, [key]: event.target.value }));

  // What is wrong with what was filled, in the visitor's words; null, nothing.
  const problem = (): string | null => {
    for (const asked of settings.fields) {
      const value: string = valueOf(asked);

      if (!value) {
        if (asked.isRequired) {
          return t("storeSite.contact.requiredField").replace(
            "{field}",
            labelOf(asked),
          );
        }

        continue;
      }

      if (asked.type === Type.EMAIL && !EMAIL.test(value)) {
        return t("storeSite.contact.invalidEmail");
      }
    }

    return null;
  };

  // Every answer on a line of its own, named: what WhatsApp opens with.
  const written = (): string =>
    settings.fields
      .filter((asked: IStoreSiteContactField) => !!valueOf(asked))
      .map(
        (asked: IStoreSiteContactField) =>
          `${labelOf(asked)}: ${valueOf(asked)}`,
      )
      .join("\n");

  const send = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    if (isPreview || isSending) {
      return;
    }

    const wrong: string | null = problem();

    if (wrong) {
      setError(wrong);
      return;
    }

    if (settings.destination === Destination.WHATSAPP && settings.whatsapp) {
      window.open(
        `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(written())}`,
        "_blank",
        "noopener,noreferrer",
      );

      setError(null);
      setSent("whatsapp");
      setAnswers({});
      return;
    }

    const filled: Record<string, string> = Object.fromEntries(
      settings.fields
        .map((asked: IStoreSiteContactField) => [asked.key, valueOf(asked)])
        .filter(([, value]) => !!value),
    );

    try {
      setIsSending(true);
      setError(null);

      const token: string | null =
        await serviceMethodsInstance.storeSitesServiceMethods.sendContact(
          slug,
          { answers: filled, ...(formKey ? { formKey } : {}) },
        );

      const first = (type: StoreSitesEnum.ContactFieldType): string | null => {
        const asked: IStoreSiteContactField | undefined = settings.fields.find(
          (each: IStoreSiteContactField) =>
            each.type === type && !!valueOf(each),
        );

        return asked ? valueOf(asked) : null;
      };

      const email: string | null = first(Type.EMAIL);

      if (token) {
        followSiteChat(slug, token, {
          name: first(Type.NAME) ?? email ?? "",
          email,
        });
      }

      setSent(
        token
          ? "chat"
          : settings.destination === Destination.INBOX && email
            ? "email"
            : "sent",
      );
      setAnswers({});
    } catch (caught: any) {
      const status: number | undefined = caught?.response?.status;

      setError(
        status === 429
          ? t("storeSite.contact.tooMany")
          : status === 400
            ? t("storeSite.contact.invalid")
            : t("storeSite.contact.failed"),
      );
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.contactDone} role="status" style={boxStyle}>
        <div className={styles.contactDoneMark} aria-hidden>
          ✓
        </div>
        <p className={styles.contactDoneTitle}>
          {t(
            sent === "whatsapp"
              ? "storeSite.contact.openedWhatsapp"
              : "storeSite.contact.sent",
          )}
        </p>
        <p>
          {settings.successMessage?.trim() ||
            t(
              sent === "chat"
                ? "storeSite.contact.sentChat"
                : sent === "email"
                  ? "storeSite.contact.sentEmail"
                  : sent === "whatsapp"
                    ? "storeSite.contact.sentWhatsapp"
                    : "storeSite.contact.sentOther",
            )}
        </p>
        <button
          type="button"
          className={styles.contactGhost}
          onClick={() => setSent(null)}
        >
          {t("storeSite.contact.again")}
        </button>
      </div>
    );
  }

  return (
    <form className={boxClassName} style={boxStyle} onSubmit={send} noValidate>
      {settings.fields.map((asked: IStoreSiteContactField) => (
        <label key={asked.key} className={styles.contactField}>
          <span>
            {labelOf(asked)}
            {!asked.isRequired && (
              <>
                {" "}
                <small>{t("storeSite.contact.optional")}</small>
              </>
            )}
          </span>
          {asked.type === Type.TEXTAREA ? (
            <textarea
              rows={5}
              maxLength={CONTACT_ANSWER_MAX[asked.type]}
              placeholder={asked.placeholder ?? undefined}
              value={answers[asked.key] ?? ""}
              onChange={set(asked.key)}
            />
          ) : asked.type === Type.SELECT ? (
            <select value={answers[asked.key] ?? ""} onChange={set(asked.key)}>
              <option value="">
                {asked.placeholder ?? t("storeSite.contact.choose")}
              </option>
              {asked.options
                // A line still being written in the editor has no words yet.
                .filter((option: string) => !!option.trim())
                .map((option: string) => (
                  <option key={option} value={option.trim()}>
                    {option.trim()}
                  </option>
                ))}
            </select>
          ) : (
            <input
              {...(INPUT_PROPS[asked.type] ?? {})}
              maxLength={CONTACT_ANSWER_MAX[asked.type]}
              placeholder={asked.placeholder ?? undefined}
              value={answers[asked.key] ?? ""}
              onChange={set(asked.key)}
            />
          )}
        </label>
      ))}

      {error && (
        <p className={styles.contactError} role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className={buttonClassName}
        disabled={isSending || isPreview}
      >
        {button.iconPosition === StoreSitesEnum.ContactIconPosition.START &&
          buttonIcon}
        <span>
          {isSending
            ? t("storeSite.contact.sending")
            : settings.buttonLabel?.trim() || t("storeSite.contact.send")}
        </span>
        {button.iconPosition === StoreSitesEnum.ContactIconPosition.END &&
          buttonIcon}
      </button>
    </form>
  );
};

export default SiteContactForm;
