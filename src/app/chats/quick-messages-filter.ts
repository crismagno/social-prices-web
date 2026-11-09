import QuickMessagesEnum from "../../shared/business/quick-messages/quick-messages.enum";
import {
  IQuickMessageAvailable,
  IQuickMessageAvailableMediaBlock,
} from "../../shared/business/quick-messages/quick-messages.types";
import { IInboxConversation } from "../../shared/business/inbox/inbox.types";

// Lower case and without accents, so "preco" finds "Preço".
export const normalize = (text: string): string =>
  (text ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

const textsOf = (message: IQuickMessageAvailable): string[] =>
  message.blocks.map((block) =>
    block.type === QuickMessagesEnum.BlockType.TEXT
      ? block.text
      : (block.caption ?? ""),
  );

// The closest first: the name starts with the typed text, then contains it,
// then one of its texts does. The API's order (most used) breaks ties; with
// nothing typed, that order is kept as it is.
export const rankQuickMessages = (
  list: IQuickMessageAvailable[],
  query: string,
): IQuickMessageAvailable[] => {
  const typed: string = normalize(query);

  if (!typed) {
    return list;
  }

  const score = (message: IQuickMessageAvailable): number => {
    const name: string = normalize(message.name);

    if (name.startsWith(typed)) {
      return 3;
    }

    if (name.includes(typed)) {
      return 2;
    }

    return textsOf(message).some((text: string) =>
      normalize(text).includes(typed),
    )
      ? 1
      : 0;
  };

  return list
    .map((message, index) => ({ message, index, score: score(message) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.message);
};

const mediaOf = (
  message: IQuickMessageAvailable,
): IQuickMessageAvailableMediaBlock[] =>
  message.blocks.filter(
    (block): block is IQuickMessageAvailableMediaBlock =>
      block.type === QuickMessagesEnum.BlockType.MEDIA,
  );

// Why this conversation cannot take the message now, as a translation key; null when it can.
export const unavailableReason = (
  message: IQuickMessageAvailable,
  target: IInboxConversation,
): string | null => {
  if (!target.canReply) {
    return "quickMessages.unavailable.windowClosed";
  }

  const media: IQuickMessageAvailableMediaBlock[] = mediaOf(message);

  if (media.length && !target.canSendMedia) {
    return "quickMessages.unavailable.noMedia";
  }

  if (
    target.maxUploadBytes !== null &&
    media.some((block) => block.size > (target.maxUploadBytes as number))
  ) {
    return "quickMessages.unavailable.tooLarge";
  }

  return null;
};

// "📷 2 · 📄 1", for the chip.
export const mediaSummary = (message: IQuickMessageAvailable): string => {
  const icons: Record<QuickMessagesEnum.MediaKind, string> = {
    [QuickMessagesEnum.MediaKind.IMAGE]: "📷",
    [QuickMessagesEnum.MediaKind.VIDEO]: "🎬",
    [QuickMessagesEnum.MediaKind.AUDIO]: "🎵",
    [QuickMessagesEnum.MediaKind.FILE]: "📄",
  };

  const counts: Map<QuickMessagesEnum.MediaKind, number> = new Map();

  mediaOf(message).forEach((block) =>
    counts.set(block.kind, (counts.get(block.kind) ?? 0) + 1),
  );

  return Array.from(counts.entries())
    .map(([kind, count]) => `${icons[kind]} ${count}`)
    .join(" · ");
};

export const firstText = (message: IQuickMessageAvailable): string =>
  textsOf(message).find((text: string) => text.trim()) ?? "";
