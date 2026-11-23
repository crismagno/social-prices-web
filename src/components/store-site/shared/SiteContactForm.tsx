"use client";

import { FormEvent, useState } from "react";

import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { followSiteChat } from "./SiteChatWidget";
import styles from "./SitePageBody.module.css";
import useSiteT from "./useSiteT";

interface Props {
  slug: string;
  /** The editor: the form is there to be seen, and sends nothing. */
  isPreview: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY = { name: "", email: "", phone: "", message: "" };

type TSent = "chat" | "email" | null;

/**
 * The form of the contact page. What is sent lands in the store's inbox as a
 * conversation of the site. Where the site has its chat on, the chat window
 * takes the conversation over, so the answer shows up there; otherwise the
 * store answers by the e-mail the visitor gave.
 */
const SiteContactForm = ({ slug, isPreview }: Props) => {
  const t = useSiteT();

  const [form, setForm] = useState(EMPTY);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<TSent>(null);

  const set =
    (field: keyof typeof EMPTY) =>
    (event: { target: { value: string } }): void =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  const send = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    if (isPreview || isSending) {
      return;
    }

    const name: string = form.name.trim();
    const email: string = form.email.trim();
    const phone: string = form.phone.trim();
    const message: string = form.message.trim();

    if (!name || !email || !message) {
      setError(t("storeSite.contact.required"));
      return;
    }

    if (!EMAIL.test(email)) {
      setError(t("storeSite.contact.invalidEmail"));
      return;
    }

    try {
      setIsSending(true);
      setError(null);

      const token: string | null =
        await serviceMethodsInstance.storeSitesServiceMethods.sendContact(
          slug,
          { name, email, phone: phone || null, message },
        );

      if (token) {
        followSiteChat(slug, token, { name, email });
      }

      setSent(token ? "chat" : "email");
      setForm(EMPTY);
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
      <div className={styles.contactDone} role="status">
        <div className={styles.contactDoneMark} aria-hidden>
          ✓
        </div>
        <p className={styles.contactDoneTitle}>{t("storeSite.contact.sent")}</p>
        <p>
          {t(
            sent === "chat"
              ? "storeSite.contact.sentChat"
              : "storeSite.contact.sentEmail",
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
    <form className={styles.contactForm} onSubmit={send} noValidate>
      <label className={styles.contactField}>
        <span>{t("storeSite.contact.name")}</span>
        <input
          autoComplete="name"
          maxLength={80}
          value={form.name}
          onChange={set("name")}
        />
      </label>

      <div className={styles.contactRow}>
        <label className={styles.contactField}>
          <span>{t("storeSite.contact.email")}</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={160}
            value={form.email}
            onChange={set("email")}
          />
        </label>

        <label className={styles.contactField}>
          <span>
            {t("storeSite.contact.phone")}{" "}
            <small>{t("storeSite.contact.optional")}</small>
          </span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={30}
            value={form.phone}
            onChange={set("phone")}
          />
        </label>
      </div>

      <label className={styles.contactField}>
        <span>{t("storeSite.contact.message")}</span>
        <textarea
          rows={5}
          maxLength={2000}
          value={form.message}
          onChange={set("message")}
        />
      </label>

      {error && (
        <p className={styles.contactError} role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className={styles.contactSend}
        disabled={isSending || isPreview}
      >
        {t(isSending ? "storeSite.contact.sending" : "storeSite.contact.send")}
      </button>
    </form>
  );
};

export default SiteContactForm;
