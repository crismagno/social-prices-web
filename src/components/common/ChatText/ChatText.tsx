"use client";

import { ReactNode } from "react";

interface Props {
  text: string;
  /** Whether the channel writes bold, italic and the rest with marks. */
  isFormatted?: boolean;
}

// The marks of WhatsApp, which the store's own chats use too.
const MARKS: Record<string, (inner: ReactNode, key: string) => ReactNode> = {
  "*": (inner, key) => <strong key={key}>{inner}</strong>,
  _: (inner, key) => <em key={key}>{inner}</em>,
  "~": (inner, key) => <s key={key}>{inner}</s>,
  "`": (inner, key) => (
    <code
      key={key}
      style={{
        fontFamily: "monospace",
        background: "rgba(127, 127, 127, 0.15)",
        borderRadius: 4,
        padding: "0 4px",
      }}
    >
      {inner}
    </code>
  ),
};

// A mark opens after the start, a space or a sign, closes before the end, a
// space or a sign, and holds words that neither start nor end with a space,
// all on one line: "2*3*4" stays as it is.
const MARKED: RegExp =
  /(^|[\s([{"'.,;:!?-])([*_~`])(?![\s])([^\n]*?[^\s\n])\2(?=$|[\s)\]}"'.,;:!?-])/;

/** The marks of a text made into formatting, the rest left as words. */
const formatted = (text: string, path: string): ReactNode[] => {
  const nodes: ReactNode[] = [];

  let rest: string = text;
  let index: number = 0;

  while (rest) {
    const match: RegExpExecArray | null = MARKED.exec(rest);

    if (!match) {
      nodes.push(rest);
      break;
    }

    const [whole, before, mark, inner] = match;
    const start: number = match.index + before.length;

    if (start > 0) {
      nodes.push(rest.slice(0, start));
    }

    const key: string = `${path}-${index++}`;

    // Code shows its words as they are; the others can hold more marks.
    nodes.push(MARKS[mark](mark === "`" ? inner : formatted(inner, key), key));

    rest = rest.slice(match.index + whole.length);
  }

  return nodes;
};

/**
 * The words of a chat message, with its lines kept. On the channels that use
 * marks, *bold*, _italic_, ~struck~ and `code` show as such.
 */
export default function ChatText({ text, isFormatted = false }: Props) {
  return (
    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {isFormatted ? formatted(text, "m") : text}
    </div>
  );
}
