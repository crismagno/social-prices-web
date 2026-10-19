import {
  IMessengerChat,
  IMessengerMessage,
} from "../../../shared/business/apps/messenger/messenger.types";

// Messenger's blue. It carries the brand across the whole Messenger app.
export const MESSENGER_BLUE: string = "#0A7CFF";

// The person's name as Facebook gave it, or a neutral label.
export const chatDisplayName = (
  chat: Pick<IMessengerChat, "name">,
  fallback: string,
): string => chat.name || fallback;

export const chatInitial = (displayName: string): string =>
  (displayName.trim()[0] ?? "?").toUpperCase();

// Name, linked customer or the last message: any of them matches.
export const chatMatchesSearch = (
  chat: IMessengerChat,
  displayName: string,
  term: string,
): boolean => {
  const needle: string = term.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  return [displayName, chat.customerName, chat.lastMessageText].some((value) =>
    value?.toLowerCase().includes(needle),
  );
};

// Oldest first, each message once. ObjectIds sort by creation time, so the id is
// the order the messages were stored in.
export const mergeMessages = (
  current: IMessengerMessage[],
  incoming: IMessengerMessage[],
): IMessengerMessage[] => {
  const byId = new Map<string, IMessengerMessage>();

  for (const message of [...current, ...incoming]) {
    byId.set(message._id, message);
  }

  return Array.from(byId.values()).sort((a, b) => a._id.localeCompare(b._id));
};

// The code the API put on a known refusal, or null for anything else.
export const messengerErrorCode = (error: any): string | null =>
  error?.response?.data?.error?.code ?? error?.response?.data?.code ?? null;

// How the file of a message is shown: pictures are drawn, video and audio are
// played, the rest is offered for download.
export const attachmentKind = (
  type: string,
): "image" | "video" | "audio" | "file" =>
  type === "image"
    ? "image"
    : type === "video"
      ? "video"
      : type === "audio"
        ? "audio"
        : "file";
