import {
  ITelegramChat,
  ITelegramMessage,
} from "../../../shared/business/apps/telegram/telegram.types";

type Person = Pick<ITelegramChat, "firstName" | "lastName" | "username">;

// A person's name as Telegram gave it, then their @username, then a neutral label.
export const chatDisplayName = (person: Person, fallback: string): string =>
  [person.firstName, person.lastName].filter(Boolean).join(" ") ||
  (person.username ? `@${person.username}` : fallback);

export const chatInitial = (displayName: string): string =>
  (displayName.replace(/^@/, "").trim()[0] ?? "?").toUpperCase();

// Name, @username, linked customer or the last message: any of them matches.
export const chatMatchesSearch = (
  chat: ITelegramChat,
  displayName: string,
  term: string,
): boolean => {
  const needle: string = term.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  return [
    displayName,
    chat.username,
    chat.customerName,
    chat.lastMessageText,
  ].some((value) => value?.toLowerCase().includes(needle));
};

// Oldest first, each message once. ObjectIds sort by creation time, so the id is
// the order the messages were stored in.
export const mergeMessages = (
  current: ITelegramMessage[],
  incoming: ITelegramMessage[],
): ITelegramMessage[] => {
  const byId = new Map<string, ITelegramMessage>();

  for (const message of [...current, ...incoming]) {
    byId.set(message._id, message);
  }

  return Array.from(byId.values()).sort((a, b) => a._id.localeCompare(b._id));
};

// The code the API put on a known refusal, or null for anything else.
export const telegramErrorCode = (error: any): string | null =>
  error?.response?.data?.error?.code ?? error?.response?.data?.code ?? null;

// Where a moment falls relative to now, for the day separators of a conversation.
export const relativeDay = (
  at: string | Date,
  now: Date = new Date(),
): "today" | "yesterday" | "other" => {
  const startOf = (value: Date): number =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();

  const days: number = Math.round(
    (startOf(now) - startOf(new Date(at))) / 86_400_000,
  );

  return days === 0 ? "today" : days === 1 ? "yesterday" : "other";
};

export type MediaKind =
  "image" | "video" | "audio" | "file" | "animated-sticker";

// How a file is shown. A sticker that is animated (.tgs) is not a picture a browser
// can draw, so it ends up as a file like any other.
export const mediaKind = (mimeType: string | null): MediaKind => {
  // Telegram's animated stickers: a gzipped Lottie animation.
  if (mimeType === "application/x-tgsticker") {
    return "animated-sticker";
  }

  if (mimeType?.startsWith("image/")) {
    return mimeType === "image/svg+xml" ? "file" : "image";
  }

  if (mimeType?.startsWith("video/")) {
    return "video";
  }

  if (mimeType?.startsWith("audio/")) {
    return "audio";
  }

  return "file";
};

export const formatFileSize = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
