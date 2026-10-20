import dayjs from "dayjs";

import InboxEnum from "../../shared/business/inbox/inbox.enum";
import {
  IInboxChat,
  IInboxConversation,
  IInboxMessage,
} from "../../shared/business/inbox/inbox.types";
import { INSTAGRAM_PINK } from "../apps/instagram/instagram-display";
import { MESSENGER_BLUE } from "../apps/messenger/messenger-display";
import { TELEGRAM_BLUE } from "../apps/telegram/telegram-theme";

// Each channel keeps its brand color wherever it shows in the central chat.
export const CHANNEL_COLOR: Record<InboxEnum.Channel, string> = {
  [InboxEnum.Channel.TELEGRAM]: TELEGRAM_BLUE,
  [InboxEnum.Channel.MESSENGER]: MESSENGER_BLUE,
  [InboxEnum.Channel.INSTAGRAM]: INSTAGRAM_PINK,
};

export const chatInitial = (name: string): string =>
  (name.replace(/^@/, "").trim()[0] ?? "?").toUpperCase();

// The person as the channel names them: name, then @username.
export const conversationName = (
  conversation: Pick<IInboxConversation, "name" | "username">,
  fallback: string,
): string =>
  conversation.name ||
  (conversation.username ? `@${conversation.username}` : fallback);

export const chatName = (chat: IInboxChat, fallback: string): string =>
  chat.name || fallback;

// A number that is always the same for the same row, to pick its color.
export const seedOf = (key: string): number =>
  Array.from(key).reduce((sum, char) => sum + char.charCodeAt(0), 0);

// The customer, a person's name, or the last message: any of them matches.
export const chatMatches = (
  chat: IInboxChat,
  name: string,
  term: string,
): boolean => {
  const needle: string = term.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  return [
    name,
    chat.lastMessageText,
    ...chat.conversations.flatMap((conversation) => [
      conversation.name,
      conversation.username,
    ]),
  ].some((value) => value?.toLowerCase().includes(needle));
};

// Today shows the hour; older shows the day.
export const formatWhen = (at: string): string => {
  const when = dayjs(at);

  return when.isSame(dayjs(), "day")
    ? when.format("HH:mm")
    : when.format("DD/MM");
};

// Oldest first, each message once, in the order of the timeline: when it was
// sent, then the order it was stored in.
export const mergeMessages = (
  current: IInboxMessage[],
  incoming: IInboxMessage[],
): IInboxMessage[] => {
  const byId = new Map<string, IInboxMessage>();

  for (const message of [...current, ...incoming]) {
    byId.set(message._id, message);
  }

  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime() ||
      a._id.localeCompare(b._id),
  );
};

// The kinds the texts have a name for.
export const contentKey = (kind: InboxEnum.MessageKind): string =>
  kind.toLowerCase();

// How the file of a message is shown.
export const attachmentShape = (
  kind: InboxEnum.MessageKind,
  mimeType: string | null,
): "image" | "video" | "audio" | "file" | "animated-sticker" => {
  // Telegram's animated stickers: a gzipped Lottie animation, not a picture.
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

  return kind === InboxEnum.MessageKind.IMAGE
    ? "image"
    : kind === InboxEnum.MessageKind.VIDEO
      ? "video"
      : kind === InboxEnum.MessageKind.AUDIO ||
          kind === InboxEnum.MessageKind.VOICE
        ? "audio"
        : "file";
};
