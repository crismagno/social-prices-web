/**
 * Product descriptions and details are HTML written by the panel's editor,
 * or plain text typed before it existed (or brought by a spreadsheet). The
 * API cleans the HTML when it is saved: these helpers only read it.
 */

/** Whether a text was written in the editor (HTML) rather than typed plain. */
export const isRichText = (value: string | null | undefined): boolean =>
  /^\s*<(p|ul|ol|h[1-6]|blockquote|hr|br)[\s>/]/i.test(value ?? "");

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** A plain text as the editor's HTML: paragraphs, and its line breaks kept. */
export const toRichHtml = (value: string | null | undefined): string => {
  if (!value?.trim()) {
    return "";
  }

  if (isRichText(value)) {
    return value;
  }

  return value
    .trim()
    .split(/\n{2,}/)
    .map(
      (paragraph: string) =>
        `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
};

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

/** The words without the formatting: for a line, a card or a search. */
export const richTextToPlain = (value: string | null | undefined): string => {
  if (!isRichText(value)) {
    return value ?? "";
  }

  return (value ?? "")
    .replace(/<\/(p|h[1-6]|li|blockquote)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(
      /&(nbsp|amp|lt|gt|quot|#39);/g,
      (entity: string) => ENTITIES[entity],
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
