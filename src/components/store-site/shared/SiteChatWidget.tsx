"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import {
  AudioOutlined,
  CloseOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  PlusOutlined,
  SendOutlined,
  SmileOutlined,
} from "@ant-design/icons";

import {
  MAX_RECORDING_SECONDS,
  useVoiceRecorder,
} from "../../../app/apps/telegram/useVoiceRecorder";

import ChatText from "../../common/ChatText/ChatText";
import EmojiPanel from "../../common/EmojiPicker/EmojiPanel";
import { insertEmoji } from "../../common/EmojiPicker/insert-emoji";
import { useTypingSignal } from "../../../shared/hooks/useTypingSignal";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import {
  ISiteChatAttachment,
  ISiteChatExtraField,
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
import RichTextView from "../../common/RichText/RichTextView";

// The most one message of the site chat takes.
const SITE_CHAT_MAX_TEXT_LENGTH: number = 2000;

interface Props {
  slug: string;
  chat: Partial<IStoreSiteChat> | null | undefined;
  theme: IStoreSiteTheme;
  /** The name of the site: the title of the window when the owner gave none. */
  brandName: string;
  /**
   * In the editor's preview: it looks and opens as on the site, but keeps no
   * conversation and starts none, so nothing reaches the store's inbox.
   */
  isPreview?: boolean;
}

const OPEN_POLL_MS = 5000;
// While the window is open: how often it asks whether the store is writing.
const TYPING_POLL_MS = 2500;
const CLOSED_POLL_MS = 20000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const tokenKey = (slug: string): string => `site-chat:${slug}`;
const seenKey = (slug: string): string => `site-chat-seen:${slug}`;
// When the visitor last wrote: past the owner's minutes the chat starts over.
const activeKey = (slug: string): string => `site-chat-active:${slug}`;
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

const FOLLOW_EVENT = "site-chat:follow";

/**
 * Hands the chat window a conversation that started somewhere else on the
 * page (the form of the contact page), so the answer shows up in it.
 */
export const followSiteChat = (
  slug: string,
  token: string,
  who: ISiteChatWho,
): void => {
  write(tokenKey(slug), token);
  write(whoKey(slug), JSON.stringify(who));

  window.dispatchEvent(new Event(FOLLOW_EVENT));
};

/**
 * The chat of the site, in a corner. A visitor says who they are once (their
 * browser keeps the secret of the chat), then talks with the store, which
 * answers from its inbox. Answers are fetched every few seconds; a dot on the
 * button says one arrived while the window was closed.
 */
const SiteChatWidget = ({
  slug,
  chat,
  theme,
  brandName,
  isPreview = false,
}: Props) => {
  const t = useSiteT();

  const settings: IStoreSiteChat = siteChatOf(chat);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [who, setWho] = useState<ISiteChatWho | null>(null);
  const [messages, setMessages] = useState<ISiteChatMessage[]>([]);
  const [hasUnread, setHasUnread] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [isStoreTyping, setIsStoreTyping] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Asked before leaving a conversation: here it cannot be opened again.
  const [isAskingNew, setIsAskingNew] = useState<boolean>(false);

  // A message of the visitor being rewritten, and its new words.
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(
    null,
  );

  // A message of the visitor waiting for "yes, remove it".
  const [removingId, setRemovingId] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const emojisRef = useRef<HTMLDivElement>(null);
  const [isPickingEmoji, setIsPickingEmoji] = useState<boolean>(false);

  // A click anywhere else puts the emojis away.
  useEffect(() => {
    if (!isPickingEmoji) {
      return;
    }

    const onDown = (event: MouseEvent): void => {
      if (!emojisRef.current?.contains(event.target as Node)) {
        setIsPickingEmoji(false);
      }
    };

    document.addEventListener("mousedown", onDown);

    return () => document.removeEventListener("mousedown", onDown);
  }, [isPickingEmoji]);

  const onMicrophoneError = useCallback(
    () => setError(t("storeSite.chat.microphoneDenied")),
    [t],
  );

  const recorder = useVoiceRecorder(onMicrophoneError);

  const forget = useCallback((): void => {
    write(tokenKey(slug), null);
    write(whoKey(slug), null);
    write(activeKey(slug), null);
    setToken(null);
    setWho(null);
    setMessages([]);
  }, [slug]);

  const sessionMs: number = settings.sessionMinutes * 60 * 1000;

  /** The visitor wrote: the chat is theirs for the owner's minutes again. */
  const touch = useCallback(
    (): void => write(activeKey(slug), String(Date.now())),
    [slug],
  );

  // A chat left alone for longer than the owner allows starts over: the API
  // refuses it too, this only spares showing an old conversation.
  const isExpired = useCallback((): boolean => {
    const at: number = Number(read(activeKey(slug)));

    return at > 0 && Date.now() - at > sessionMs;
  }, [slug, sessionMs]);

  useEffect(() => {
    // The preview never takes up a conversation of the real site.
    if (isPreview) {
      return;
    }

    const adopt = (): void => {
      const stored: string | null = read(tokenKey(slug));

      if (stored && isExpired()) {
        forget();
        return;
      }

      // A chat from before this rule (or just adopted) starts its time now.
      if (stored && !read(activeKey(slug))) {
        touch();
      }

      setToken(stored);
      setWho(readWho(slug));
    };

    adopt();

    window.addEventListener(FOLLOW_EVENT, adopt);

    // Left open without writing: it ends on time too.
    const timer: number = window.setInterval(() => {
      if (read(tokenKey(slug)) && isExpired()) {
        forget();
      }
    }, 60 * 1000);

    return () => {
      window.removeEventListener(FOLLOW_EVENT, adopt);
      window.clearInterval(timer);
    };
  }, [slug, isExpired, forget, touch, isPreview]);

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

  // The visitor is writing: the store sees "typing…" in its inbox, and the
  // chat stays the visitor's for the owner's minutes again.
  useTypingSignal(text, isOpen && !!token, async () => {
    if (!token) {
      return;
    }

    touch();

    await serviceMethodsInstance.storeSitesServiceMethods.sendChatTyping(
      slug,
      token,
    );
  });

  // The store is writing: dots in the window, and its message as soon as
  // the writing stops.
  useEffect(() => {
    if (!isOpen || !token) {
      setIsStoreTyping(false);
      return;
    }

    let wasTyping: boolean = false;

    const ask = async (): Promise<void> => {
      if (document.visibilityState !== "visible") {
        return;
      }

      try {
        const isTyping: boolean =
          await serviceMethodsInstance.storeSitesServiceMethods.isStoreTyping(
            slug,
            token,
          );

        setIsStoreTyping(isTyping);

        if (wasTyping && !isTyping) {
          load();
        }

        wasTyping = isTyping;
      } catch {
        setIsStoreTyping(false);
      }
    };

    ask();

    const timer: number = window.setInterval(ask, TYPING_POLL_MS);

    return () => window.clearInterval(timer);
  }, [isOpen, token, slug, load]);

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

    if (isPreview) {
      setError(t("storeSite.chat.previewOnly"));
      return;
    }

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

    // The owner's own fields: the required ones need an answer.
    const missing: ISiteChatExtraField | undefined = settings.extraFields.find(
      (asked: ISiteChatExtraField) =>
        asked.isRequired &&
        asked.field !== StoreSitesEnum.ChatCustomerField.EMAIL &&
        asked.field !== StoreSitesEnum.ChatCustomerField.PHONE &&
        !answers[asked.field]?.trim(),
    );

    if (missing) {
      setError(
        t("storeSite.chat.requiredField", {
          field: t(`storeSite.chat.fields.${missing.field}`),
        }),
      );
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
          answers,
        });

      const newWho: ISiteChatWho = { name, email: email || null };

      write(tokenKey(slug), newToken);
      touch();
      write(whoKey(slug), JSON.stringify(newWho));
      setToken(newToken);
      setWho(newWho);
    } catch (caught: any) {
      // The API names the field it refused when it is one of the owner's.
      const refused: ISiteChatExtraField | undefined =
        settings.extraFields.find(
          (asked: ISiteChatExtraField) =>
            asked.field === caught?.response?.data?.error?.field ||
            asked.field === caught?.response?.data?.field,
        );

      setError(
        refused
          ? t("storeSite.chat.invalidField", {
              field: t(`storeSite.chat.fields.${refused.field}`),
            })
          : describeError(caught),
      );
    } finally {
      setIsBusy(false);
    }
  };

  const setAnswer = (key: string, value: string): void =>
    setAnswers((current: Record<string, string>) => ({
      ...current,
      [key]: value,
    }));

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
      touch();
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

  // The new words take the place of the old ones; the store sees them too.
  const saveEdit = async (): Promise<void> => {
    const words: string = editing?.text.trim() ?? "";

    if (!editing || !words || !token || isBusy) {
      return;
    }

    try {
      setIsBusy(true);
      setError(null);

      const edited: ISiteChatMessage =
        await serviceMethodsInstance.storeSitesServiceMethods.editChatMessage(
          slug,
          token,
          editing.id,
          words,
        );

      setMessages((current: ISiteChatMessage[]) =>
        current.map((item: ISiteChatMessage) =>
          item.id === edited.id ? { ...item, ...edited } : item,
        ),
      );
      setEditing(null);
      touch();
    } catch (caught: any) {
      if (caught?.response?.status === 401) {
        forget();
      }

      setError(describeError(caught));
    } finally {
      setIsBusy(false);
    }
  };

  // Gone for both sides, files included.
  const remove = async (id: string): Promise<void> => {
    if (!token || isBusy) {
      return;
    }

    try {
      setIsBusy(true);
      setError(null);

      await serviceMethodsInstance.storeSitesServiceMethods.deleteChatMessage(
        slug,
        token,
        id,
      );

      setMessages((current: ISiteChatMessage[]) =>
        current.filter((item: ISiteChatMessage) => item.id !== id),
      );
      setRemovingId(null);
      touch();
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
      touch();

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

  const optional = (mode: StoreSitesEnum.ChatFieldMode): string =>
    mode === StoreSitesEnum.ChatFieldMode.OPTIONAL
      ? ` ${t("storeSite.chat.optional")}`
      : "";

  const buttonLabel: string =
    settings.buttonLabel ?? t("storeSite.chat.button");

  return (
    <SiteThemeVars
      // Its own colours over the site's; one it leaves out is the site's.
      theme={{
        ...theme,
        primary: settings.colors.primary ?? theme.primary,
        background: settings.colors.background ?? theme.background,
        text: settings.colors.text ?? theme.text,
      }}
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
              {settings.greeting ? (
                <RichTextView value={settings.greeting} />
              ) : (
                t("storeSite.chat.greeting")
              )}
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
                  {editing?.id === message.id ? (
                    <div className={styles.editBox}>
                      <textarea
                        className={styles.editField}
                        aria-label={t("storeSite.chat.editMessage")}
                        value={editing.text}
                        maxLength={SITE_CHAT_MAX_TEXT_LENGTH}
                        rows={Math.min(5, editing.text.split("\n").length + 1)}
                        autoFocus
                        disabled={isBusy}
                        onChange={(event) =>
                          setEditing({
                            id: message.id,
                            text: event.target.value,
                          })
                        }
                        onKeyDown={(event) => {
                          // Enter saves, Shift+Enter breaks the line, Esc leaves.
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            saveEdit();
                          }

                          if (event.key === "Escape") {
                            setEditing(null);
                          }
                        }}
                      />
                      <span className={styles.messageActions}>
                        <button
                          type="button"
                          className={styles.messageAction}
                          disabled={isBusy}
                          onClick={() => setEditing(null)}
                        >
                          {t("storeSite.chat.cancelEdit")}
                        </button>
                        <button
                          type="button"
                          className={`${styles.messageAction} ${styles.messageActionStrong}`}
                          disabled={isBusy || !editing.text.trim()}
                          onClick={saveEdit}
                        >
                          {t("storeSite.chat.saveEdit")}
                        </button>
                      </span>
                    </div>
                  ) : (
                    message.text && <ChatText text={message.text} isFormatted />
                  )}
                  <span className={styles.time}>
                    {time(message.sentAt)}
                    {message.editedAt && ` · ${t("storeSite.chat.edited")}`}
                  </span>

                  {/* What the visitor wrote, they can change or take back. */}
                  {!message.fromStore && editing?.id !== message.id && (
                    <span className={styles.messageActions}>
                      {removingId === message.id ? (
                        <>
                          <span>{t("storeSite.chat.removeConfirm")}</span>
                          <button
                            type="button"
                            className={styles.messageAction}
                            disabled={isBusy}
                            onClick={() => setRemovingId(null)}
                          >
                            {t("storeSite.chat.no")}
                          </button>
                          <button
                            type="button"
                            className={`${styles.messageAction} ${styles.messageActionStrong}`}
                            disabled={isBusy}
                            onClick={() => remove(message.id)}
                          >
                            {t("storeSite.chat.yesRemove")}
                          </button>
                        </>
                      ) : (
                        <>
                          {message.text && (
                            <button
                              type="button"
                              className={styles.messageAction}
                              disabled={isBusy}
                              onClick={() => {
                                setRemovingId(null);
                                setEditing({
                                  id: message.id,
                                  text: message.text ?? "",
                                });
                              }}
                            >
                              {t("storeSite.chat.editMessage")}
                            </button>
                          )}
                          <button
                            type="button"
                            className={styles.messageAction}
                            disabled={isBusy}
                            onClick={() => {
                              setEditing(null);
                              setRemovingId(message.id);
                            }}
                          >
                            {t("storeSite.chat.removeMessage")}
                          </button>
                        </>
                      )}
                    </span>
                  )}
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
                {settings.extraFields.map((asked: ISiteChatExtraField) => {
                  const name: string = t(
                    `storeSite.chat.fields.${asked.field}`,
                  );
                  const label: string = asked.isRequired
                    ? name
                    : `${name} ${t("storeSite.chat.optional")}`;
                  const value: string = answers[asked.field] ?? "";
                  const F = StoreSitesEnum.ChatCustomerField;

                  // Email and phone keep their own inputs, where the owner put them.
                  if (asked.field === F.EMAIL) {
                    return (
                      <input
                        key={asked.field}
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
                    );
                  }

                  if (asked.field === F.PHONE) {
                    return (
                      <input
                        key={asked.field}
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
                    );
                  }

                  if (asked.field === F.GENDER) {
                    return (
                      <select
                        key={asked.field}
                        className={styles.field}
                        aria-label={name}
                        value={value}
                        onChange={(event) =>
                          setAnswer(asked.field, event.target.value)
                        }
                      >
                        <option value="">{label}</option>
                        {["FEMALE", "MALE", "OTHER"].map((gender: string) => (
                          <option key={gender} value={gender}>
                            {t(`storeSite.chat.genders.${gender}`)}
                          </option>
                        ))}
                      </select>
                    );
                  }

                  if (asked.field === F.BIRTH_DATE) {
                    return (
                      <label key={asked.field} className={styles.fieldLabel}>
                        <span>{label}</span>
                        <input
                          className={styles.field}
                          type="date"
                          aria-label={name}
                          max={new Date().toISOString().slice(0, 10)}
                          value={value}
                          onChange={(event) =>
                            setAnswer(asked.field, event.target.value)
                          }
                        />
                      </label>
                    );
                  }

                  return (
                    <input
                      key={asked.field}
                      className={styles.field}
                      type="text"
                      inputMode={asked.field === F.CPF ? "numeric" : undefined}
                      autoComplete={
                        asked.field === F.ADDRESS ? "street-address" : undefined
                      }
                      maxLength={asked.field === F.ADDRESS ? 160 : 30}
                      placeholder={label}
                      aria-label={name}
                      value={value}
                      onChange={(event) =>
                        setAnswer(asked.field, event.target.value)
                      }
                    />
                  );
                })}
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
            {token && isStoreTyping && !isBusy && (
              <div
                className={`${styles.bubble} ${styles.fromStore} ${styles.typing}`}
                aria-label={t("storeSite.chat.storeTyping")}
              >
                <span />
                <span />
                <span />
              </div>
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
              <div ref={emojisRef} className={styles.emojis}>
                <button
                  type="button"
                  className={styles.tool}
                  aria-label={t("storeSite.chat.emoji")}
                  title={t("storeSite.chat.emoji")}
                  aria-expanded={isPickingEmoji}
                  disabled={isBusy}
                  onClick={() => setIsPickingEmoji((open: boolean) => !open)}
                >
                  <SmileOutlined />
                </button>
                {isPickingEmoji && (
                  <div className={styles.emojisPopup}>
                    <EmojiPanel
                      onPick={(emoji: string) =>
                        insertEmoji(
                          textRef.current,
                          text,
                          emoji,
                          SITE_CHAT_MAX_TEXT_LENGTH,
                          setText,
                        )
                      }
                    />
                  </div>
                )}
              </div>
              <textarea
                ref={textRef}
                className={styles.field}
                rows={1}
                maxLength={SITE_CHAT_MAX_TEXT_LENGTH}
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
