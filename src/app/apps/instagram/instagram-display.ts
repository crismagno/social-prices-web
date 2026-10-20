import {
  IInstagramChat,
  IInstagramMessage,
} from "../../../shared/business/apps/instagram/instagram.types";

// Instagram's pink. It carries the brand across the whole Instagram app.
export const INSTAGRAM_PINK: string = "#E1306C";

// The person's name as Instagram gave it, then their @username, then a neutral label.
export const chatDisplayName = (
  chat: Pick<IInstagramChat, "name" | "username">,
  fallback: string,
): string => chat.name || (chat.username ? `@${chat.username}` : fallback);

export const chatInitial = (displayName: string): string =>
  (displayName.replace(/^@/, "").trim()[0] ?? "?").toUpperCase();

// Name, username, linked customer or the last message: any of them matches.
export const chatMatchesSearch = (
  chat: IInstagramChat,
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
  current: IInstagramMessage[],
  incoming: IInstagramMessage[],
): IInstagramMessage[] => {
  const byId = new Map<string, IInstagramMessage>();

  for (const message of [...current, ...incoming]) {
    byId.set(message._id, message);
  }

  return Array.from(byId.values()).sort((a, b) => a._id.localeCompare(b._id));
};

// The code the API put on a known refusal, or null for anything else.
export const instagramErrorCode = (error: any): string | null =>
  error?.response?.data?.error?.code ?? error?.response?.data?.code ?? null;

// The kinds of message the texts have a name for; anything else reads as a file.
const KNOWN_CONTENT: string[] = [
  "image",
  "video",
  "audio",
  "file",
  "unsupported",
  "share",
  "story_mention",
  "ig_reel",
];

export const contentKey = (type: string): string =>
  KNOWN_CONTENT.includes(type) ? type : "file";

// How the file of a message is shown: pictures are drawn, video and audio are
// played, the rest is offered for download.
export const attachmentKind = (
  type: string,
): "image" | "video" | "audio" | "file" =>
  type === "image" || type === "ig_reel" || type === "story_mention"
    ? type === "image"
      ? "image"
      : "file"
    : type === "video"
      ? "video"
      : type === "audio"
        ? "audio"
        : "file";
