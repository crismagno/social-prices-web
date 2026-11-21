import dayjs from "dayjs";

import InboxEnum from "../../shared/business/inbox/inbox.enum";
import {
  IInboxChat,
  IInboxConversation,
  IInboxMessage,
} from "../../shared/business/inbox/inbox.types";
import { INSTAGRAM_PINK } from "../apps/instagram/instagram-display";
import { MESSENGER_BLUE } from "../apps/messenger/messenger-display";
import { WHATSAPP_GREEN } from "../apps/whatsapp/whatsapp-display";
import { TELEGRAM_BLUE } from "../apps/telegram/telegram-theme";
import { STORE_CHAT_COLOR } from "../../components/common/ChannelIcon/ChannelIcon";

// Each channel keeps its brand color wherever it shows in the central chat.
export const CHANNEL_COLOR: Record<InboxEnum.Channel, string> = {
  [InboxEnum.Channel.TELEGRAM]: TELEGRAM_BLUE,
  [InboxEnum.Channel.MESSENGER]: MESSENGER_BLUE,
  [InboxEnum.Channel.INSTAGRAM]: INSTAGRAM_PINK,
  [InboxEnum.Channel.WHATSAPP]: WHATSAPP_GREEN,
  [InboxEnum.Channel.STORE]: STORE_CHAT_COLOR,
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

// What a thread shows after its newest page was read again: that page is the
// truth for the stretch of time it covers, so a message of that stretch that is
// not in it was removed (by the other side, or elsewhere) and leaves the screen.
// Older messages already loaded stay, unless the page is the whole thread.
// `keepIds` are messages added here that a request already on its way may not
// have seen yet. Oldest first, each message once.
export const reconcileLatest = <T extends { _id: string; sentAt: string }>(
  current: T[],
  page: T[],
  isWholeThread: boolean,
  keepIds: Set<string>,
): T[] => {
  const time = (message: T): number => new Date(message.sentAt).getTime();

  const inPage: Set<string> = new Set(page.map((message: T) => message._id));

  const oldest: number = page.length
    ? Math.min(...page.map(time))
    : Number.POSITIVE_INFINITY;

  const kept: T[] = current.filter(
    (message: T) =>
      !inPage.has(message._id) &&
      (keepIds.has(message._id) || (!isWholeThread && time(message) < oldest)),
  );

  return [...kept, ...page].sort(
    (a: T, b: T) => time(a) - time(b) || a._id.localeCompare(b._id),
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
