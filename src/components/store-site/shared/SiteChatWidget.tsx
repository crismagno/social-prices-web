"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import {
  AudioOutlined,
  CloseOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  PlusOutlined,
  SendOutlined,
} from "@ant-design/icons";

import {
  MAX_RECORDING_SECONDS,
  useVoiceRecorder,
} from "../../../app/apps/telegram/useVoiceRecorder";

import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import {
  ISiteChatAttachment,
  ISiteChatMessage,
  IStoreSiteChat,
  SITE_CHAT_MAX_UPLOAD_BYTES,
  siteChatOf,
} from "../../../shared/business/store-sites/store-site-chat";
import { IStoreSiteTheme } from "../../../shared/business/store-sites/store-site.interface";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import SiteChatAttachment from "./SiteChatAttachment";
import SiteChatIcon from "./SiteChatIcon";
import styles from "./SiteChatWidget.module.css";
import SiteThemeVars from "./SiteThemeVars";
import useSiteT from "./useSiteT";

interface Props {
  slug: string;
  chat: Partial<IStoreSiteChat> | null | undefined;
  theme: IStoreSiteTheme;
  /** The name of the site: the title of the window when the owner gave none. */
  brandName: string;
}

const OPEN_POLL_MS = 5000;
const CLOSED_POLL_MS = 20000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const tokenKey = (slug: string): string => `site-chat:${slug}`;
const seenKey = (slug: string): string => `site-chat-seen:${slug}`;
const whoKey = (slug: string): string => `site-chat-who:${slug}`;

/** Who the visitor said they are, for them to see whose conversation this is. */
interface ISiteChatWho {
  name: string;
  email: string | null;
}

const readWho = (slug: string): ISiteChatWho | null => {
  try {
    const parsed: any = JSON.parse(read(whoKey(slug)) ?? "null");

    return typeof parsed?.name === "string" && parsed.name
      ? {
          name: parsed.name,
          email: typeof parsed.email === "string" ? parsed.email : null,
        }
      : null;
  } catch {
    return null;
  }
};

const read = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string | null): void => {
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // No storage: the chat works for this visit only.
  }
};

/**
 * The chat of the site, in a corner. A visitor says who they are once (their
 * browser keeps the secret of the chat), then talks with the store, which
 * answers from its inbox. Answers are fetched every few seconds; a dot on the
 * button says one arrived while the window was closed.
 */
const SiteChatWidget = ({ slug, chat, theme, brandName }: Props) => {
  const t = useSiteT();

  const settings: IStoreSiteChat = siteChatOf(chat);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [who, setWho] = useState<ISiteChatWho | null>(null);
  const [messages, setMessages] = useState<ISiteChatMessage[]>([]);
  const [hasUnread, setHasUnread] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  // Asked before leaving a conversation: here it cannot be opened again.
  const [isAskingNew, setIsAskingNew] = useState<boolean>(false);

  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onMicrophoneError = useCallback(
    () => setError(t("storeSite.chat.microphoneDenied")),
    [t],
  );

  const recorder = useVoiceRecorder(onMicrophoneError);

  useEffect(() => {
    setToken(read(tokenKey(slug)));
    setWho(readWho(slug));
  }, [slug]);

  const forget = useCallback((): void => {
    write(tokenKey(slug), null);
    write(whoKey(slug), null);
    setToken(null);
    setWho(null);
    setMessages([]);
  }, [slug]);

  const load = useCallback(async (): Promise<void> => {
    if (!token) {
      return;
    }

    try {
      const list: ISiteChatMessage[] =
        await serviceMethodsInstance.storeSitesServiceMethods.listChat(
          slug,
          token,
        );

      setMessages(list);

      const lastFromStore: ISiteChatMessage | undefined = [...list]
        .reverse()
        .find((message: ISiteChatMessage) => message.fromStore);

      if (lastFromStore && read(seenKey(slug)) !== lastFromStore.id) {
        setHasUnread(true);
      }
    } catch (caught: any) {
      // The chat was removed, or the store turned it off: start over.
      if ([401, 404].includes(caught?.response?.status)) {
        forget();
      }
    }
  }, [slug, token, forget]);

  useEffect(() => {
    if (!token) {
      return;
    }

    load();

    const timer: number = window.setInterval(
      () => {
        if (document.visibilityState === "visible") {
          load();
        }
      },
      isOpen ? OPEN_POLL_MS : CLOSED_POLL_MS,
    );

    return () => window.clearInterval(timer);
  }, [token, isOpen, load]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Open: what the store said has been read.
    const lastFromStore: ISiteChatMessage | undefined = [...messages]
      .reverse()
      .find((message: ISiteChatMessage) => message.fromStore);

    if (lastFromStore) {
      write(seenKey(slug), lastFromStore.id);
    }

    setHasUnread(false);
    endRef.current?.scrollIntoView({ block: "end" });
  }, [isOpen, messages, slug]);

  // Someone else at this browser, or another subject: back to saying who is
  // writing. The store keeps the conversation that is left behind.
  const startNew = (): void => {
    recorder.cancel();

    write(seenKey(slug), null);
    forget();

    setText("");
    setError(null);
    setHasUnread(false);
    setForm({ name: "", email: "", phone: "" });
    setIsAskingNew(false);
  };

  const describeError = (caught: any): string =>
    caught?.response?.status === 429
      ? t("storeSite.chat.tooMany")
      : t("storeSite.chat.failed");

  const start = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    const name: string = form.name.trim();
    const email: string = form.email.trim();
    const phone: string = form.phone.trim();

    const isRequired = (mode: StoreSitesEnum.ChatFieldMode): boolean =>
      mode === StoreSitesEnum.ChatFieldMode.REQUIRED;

    if (
      !name ||
      (isRequired(settings.emailField) && !email) ||
      (isRequired(settings.phoneField) && !phone)
    ) {
      setError(t("storeSite.chat.required"));
      return;
    }

    if (email && !EMAIL.test(email)) {
      setError(t("storeSite.chat.invalidEmail"));
      return;
    }

    try {
      setIsBusy(true);
      setError(null);

      const newToken: string =
        await serviceMethodsInstance.storeSitesServiceMethods.startChat(slug, {
          name,
          email: email || null,
          phone: phone || null,
        });

      const newWho: ISiteChatWho = { name, email: email || null };

      write(tokenKey(slug), newToken);
      write(whoKey(slug), JSON.stringify(newWho));
      setToken(newToken);
      setWho(newWho);
    } catch (caught: any) {
      setError(describeError(caught));
    } finally {
      setIsBusy(false);
    }
  };

  const send = async (): Promise<void> => {
    const message: string = text.trim();

    if (!message || !token || isBusy) {
      return;
    }

    try {
      setIsBusy(true);
      setError(null);

      const sent: ISiteChatMessage =
        await serviceMethodsInstance.storeSitesServiceMethods.sendChat(
          slug,
          token,
          message,
        );

      setMessages((current: ISiteChatMessage[]) => [...current, sent]);
      setText("");
    } catch (caught: any) {
      if (caught?.response?.status === 401) {
        forget();
      }

      setError(describeError(caught));
    } finally {
      setIsBusy(false);
    }
  };

  /** A file or a recording, with what is written as its words. */
  const sendFile = async (file: File, voice: boolean): Promise<void> => {
    if (!token || isBusy) {
      return;
    }

    if (file.size > SITE_CHAT_MAX_UPLOAD_BYTES) {
      setError(t("storeSite.chat.tooLarge"));
      return;
    }

    try {
      setIsBusy(true);
      setError(null);

      const caption: string | null = voice ? null : text.trim() || null;

      const sent: ISiteChatMessage =
        await serviceMethodsInstance.storeSitesServiceMethods.sendChatMedia(
          slug,
          token,
          file,
          { caption, voice },
        );

      setMessages((current: ISiteChatMessage[]) => [...current, sent]);

      if (caption) {
        setText("");
      }
    } catch (caught: any) {
      if (caught?.response?.status === 401) {
        forget();
      }

      setError(
        caught?.response?.status === 413
          ? t("storeSite.chat.tooLarge")
          : describeError(caught),
      );
    } finally {
      setIsBusy(false);
    }
  };

  const finishRecording = async (): Promise<void> => {
    const recording: File | null = await recorder.finish();

    if (recording) {
      await sendFile(recording, true);
    }
  };

  // A recording has a limit: when it is reached, it goes as it is.
  useEffect(() => {
    if (
      recorder.state === "recording" &&
      recorder.seconds >= MAX_RECORDING_SECONDS
    ) {
      finishRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.seconds, recorder.state]);

  if (!settings.isActive) {
    return null;
  }

  const clock = (seconds: number): string =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const time = (at: string): string =>
    new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const askEmail: boolean =
    settings.emailField !== StoreSitesEnum.ChatFieldMode.HIDDEN;
  const askPhone: boolean =
    settings.phoneField !== StoreSitesEnum.ChatFieldMode.HIDDEN;

  const optional = (mode: StoreSitesEnum.ChatFieldMode): string =>
    mode === StoreSitesEnum.ChatFieldMode.OPTIONAL
      ? ` ${t("storeSite.chat.optional")}`
      : "";

  const buttonLabel: string =
    settings.buttonLabel ?? t("storeSite.chat.button");

  return (
    <SiteThemeVars
      theme={theme}
      className={`${styles.dock} ${
        settings.position === StoreSitesEnum.ChatPosition.LEFT
          ? styles.left
          : styles.right
      }`}
    >
      {isOpen && (
        <section
          className={styles.panel}
          role="dialog"
          aria-label={settings.title ?? brandName}
        >
          <header className={styles.header}>
            <span className={styles.blob} aria-hidden />
            <span className={styles.avatar} aria-hidden>
              {(settings.title ?? brandName).trim().charAt(0).toUpperCase()}
              <span className={styles.online} />
            </span>
            <div className={styles.heading}>
              <p className={styles.title}>{settings.title ?? brandName}</p>
              <p className={styles.subtitle}>{t("storeSite.chat.subtitle")}</p>
            </div>
            {token && (
              <button
                type="button"
                className={styles.headerTool}
                aria-label={t("storeSite.chat.new")}
                title={t("storeSite.chat.new")}
                disabled={isBusy}
                onClick={() => setIsAskingNew(true)}
              >
                <PlusOutlined />
              </button>
            )}
            <button
              type="button"
              className={styles.close}
              aria-label={t("storeSite.chat.close")}
              onClick={() => setIsOpen(false)}
            >
              <CloseOutlined />
            </button>
          </header>

          {token && who && (
            <p className={styles.who}>
              {t("storeSite.chat.who")} <strong>{who.name}</strong>
              {who.email && <span> · {who.email}</span>}
            </p>
          )}

          <div className={styles.body} aria-live="polite">
            <div className={`${styles.bubble} ${styles.fromStore}`}>
              {settings.greeting ?? t("storeSite.chat.greeting")}
            </div>

            {token ? (
              messages.map((message: ISiteChatMessage) => (
                <div
                  key={message.id}
                  className={`${styles.bubble} ${
                    message.fromStore ? styles.fromStore : styles.fromVisitor
                  }`}
                >
                  {(message.attachments ?? []).map(
                    (attachment: ISiteChatAttachment, index: number) => (
                      <SiteChatAttachment
                        key={`${message.id}-${index}`}
                        slug={slug}
                        token={token}
                        messageId={message.id}
                        index={index}
                        attachment={attachment}
                        downloadLabel={t("storeSite.chat.download")}
                      />
                    ),
                  )}
                  {message.text}
                  <span className={styles.time}>{time(message.sentAt)}</span>
                </div>
              ))
            ) : (
              <form className={styles.form} onSubmit={start} noValidate>
                <p className={styles.intro}>{t("storeSite.chat.intro")}</p>
                <input
                  className={styles.field}
                  placeholder={t("storeSite.chat.name")}
                  aria-label={t("storeSite.chat.name")}
                  autoComplete="name"
                  maxLength={80}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
                {askEmail && (
                  <input
                    className={styles.field}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={`${t("storeSite.chat.email")}${optional(settings.emailField)}`}
                    aria-label={t("storeSite.chat.email")}
                    maxLength={160}
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                  />
                )}
                {askPhone && (
                  <input
                    className={styles.field}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={`${t("storeSite.chat.phone")}${optional(settings.phoneField)}`}
                    aria-label={t("storeSite.chat.phone")}
                    maxLength={30}
                    value={form.phone}
                    onChange={(event) =>
                      setForm({ ...form, phone: event.target.value })
                    }
                  />
                )}
                {error && <p className={styles.error}>{error}</p>}
                <button
                  type="submit"
                  className={styles.primary}
                  disabled={isBusy}
                >
                  {t("storeSite.chat.start")}
                </button>
              </form>
            )}
            {token && isBusy && (
              <div
                className={`${styles.bubble} ${styles.fromVisitor} ${styles.typing}`}
                aria-hidden
              >
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={endRef} />
          </div>

          {token && isAskingNew && (
            <div className={styles.confirm} role="alertdialog">
              <p>{t("storeSite.chat.newConfirm")}</p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.ghost}
                  onClick={() => setIsAskingNew(false)}
                >
                  {t("storeSite.chat.newCancel")}
                </button>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={startNew}
                >
                  {t("storeSite.chat.newStart")}
                </button>
              </div>
            </div>
          )}

          {token && recorder.state !== "idle" && (
            <div className={`${styles.composer} ${styles.recording}`}>
              <button
                type="button"
                className={styles.tool}
                aria-label={t("storeSite.chat.cancelRecording")}
                onClick={recorder.cancel}
                disabled={recorder.state !== "recording"}
              >
                <DeleteOutlined />
              </button>
              <span className={styles.recordingInfo}>
                <span className={styles.recordingDot} />
                {recorder.state === "recording"
                  ? `${t("storeSite.chat.recording")} ${clock(recorder.seconds)}`
                  : t("storeSite.chat.preparing")}
                <span className={styles.wave} aria-hidden>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              </span>
              <button
                type="button"
                className={styles.send}
                aria-label={t("storeSite.chat.sendRecording")}
                onClick={finishRecording}
                disabled={recorder.state !== "recording"}
              >
                <SendOutlined />
              </button>
            </div>
          )}

          {token && recorder.state === "idle" && (
            <div className={styles.composer}>
              <input
                ref={fileRef}
                type="file"
                hidden
                onChange={(event) => {
                  const file: File | undefined = event.target.files?.[0];

                  event.target.value = "";

                  if (file) {
                    sendFile(file, false);
                  }
                }}
              />
              <button
                type="button"
                className={styles.tool}
                aria-label={t("storeSite.chat.attach")}
                title={t("storeSite.chat.attach")}
                disabled={isBusy}
                onClick={() => fileRef.current?.click()}
              >
                <PaperClipOutlined />
              </button>
              <textarea
                className={styles.field}
                rows={1}
                maxLength={2000}
                placeholder={t("storeSite.chat.placeholder")}
                aria-label={t("storeSite.chat.placeholder")}
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  // Enter sends; Shift+Enter starts a new line.
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
              />
              {text.trim() ? (
                <button
                  type="button"
                  className={styles.send}
                  aria-label={t("storeSite.chat.send")}
                  disabled={isBusy}
                  onClick={send}
                >
                  <SendOutlined />
                </button>
              ) : (
                <button
                  type="button"
                  className={`${styles.send} ${styles.mic}`}
                  aria-label={t("storeSite.chat.record")}
                  title={t("storeSite.chat.record")}
                  disabled={isBusy}
                  onClick={() => {
                    setError(null);
                    recorder.start();
                  }}
                >
                  <AudioOutlined />
                </button>
              )}
            </div>
          )}
          {token && error && (
            <p className={styles.error} style={{ padding: "0 12px 10px" }}>
              {error}
            </p>
          )}
        </section>
      )}

      <button
        type="button"
        className={styles.button}
        aria-expanded={isOpen}
        aria-label={isOpen ? t("storeSite.chat.close") : buttonLabel}
        onClick={() => setIsOpen((open: boolean) => !open)}
      >
        <span className={styles.halo} aria-hidden />
        <span key={isOpen ? "close" : "open"} className={styles.icon}>
          {isOpen ? <CloseOutlined /> : <SiteChatIcon icon={settings.icon} />}
        </span>
        <span className={styles.label}>{buttonLabel}</span>
        {hasUnread && !isOpen && <span className={styles.dot} />}
      </button>
    </SiteThemeVars>
  );
};

export default SiteChatWidget;
