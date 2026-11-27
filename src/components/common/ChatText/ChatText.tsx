"use client";

import { CSSProperties, ReactNode } from "react";

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

// How the API writes the editor's lists, quotes and rules in a chat message.
const BULLET: RegExp = /^[•-] (.*)$/;
const NUMBERED: RegExp = /^(\d{1,3})\. (.*)$/;
const QUOTED: RegExp = /^> ?(.*)$/;
const RULE: RegExp = /^———$/;

// What follows an item on its next lines comes pushed in by three spaces.
const CONTINUED: RegExp = /^ {3}/;

const TEXT_STYLE: CSSProperties = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const LIST_STYLE: CSSProperties = {
  margin: "2px 0",
  paddingLeft: "1.5em",
};

const QUOTE_STYLE: CSSProperties = {
  ...TEXT_STYLE,
  margin: "4px 0",
  paddingLeft: 8,
  borderLeft: "3px solid color-mix(in srgb, currentColor 45%, transparent)",
  opacity: 0.9,
};

const RULE_STYLE: CSSProperties = {
  margin: "6px 0",
  border: 0,
  borderTop: "1px solid color-mix(in srgb, currentColor 35%, transparent)",
};

interface IListItem {
  number: number | null;
  lines: string[];
}

/** The lines of a text made into lists, quotes and rules, the rest as words. */
const blocks = (text: string, path: string): ReactNode[] => {
  const lines: string[] = text.split("\n");
  const nodes: ReactNode[] = [];

  let words: string[] = [];
  let index: number = 0;

  // The words gathered so far, without the empty lines that only kept them
  // apart from a list or a quote: those have room of their own.
  const flushWords = (): void => {
    while (words.length && !words[0].trim()) {
      words.shift();
    }

    while (words.length && !words[words.length - 1].trim()) {
      words.pop();
    }

    if (words.length) {
      const key: string = `${path}-w${nodes.length}`;

      nodes.push(
        <div key={key} style={TEXT_STYLE}>
          {formatted(words.join("\n"), key)}
        </div>,
      );
    }

    words = [];
  };

  while (index < lines.length) {
    const line: string = lines[index];
    const pattern: RegExp | null = BULLET.test(line)
      ? BULLET
      : NUMBERED.test(line)
        ? NUMBERED
        : null;

    if (pattern) {
      flushWords();

      const isNumbered: boolean = pattern === NUMBERED;
      const items: IListItem[] = [];

      while (index < lines.length) {
        const match: RegExpExecArray | null = pattern.exec(lines[index]);

        if (match) {
          items.push({
            number: isNumbered ? Number(match[1]) : null,
            lines: [match[isNumbered ? 2 : 1]],
          });
        } else if (CONTINUED.test(lines[index])) {
          items[items.length - 1].lines.push(lines[index].slice(3));
        } else {
          break;
        }

        index++;
      }

      const key: string = `${path}-l${nodes.length}`;
      const List = isNumbered ? "ol" : "ul";

      nodes.push(
        <List
          key={key}
          style={{
            ...LIST_STYLE,
            listStyleType: isNumbered ? "decimal" : "disc",
          }}
        >
          {items.map((item: IListItem, itemIndex: number) => (
            <li key={`${key}-${itemIndex}`} value={item.number ?? undefined}>
              {blocks(item.lines.join("\n"), `${key}-${itemIndex}`)}
            </li>
          ))}
        </List>,
      );

      continue;
    }

    if (QUOTED.test(line)) {
      flushWords();

      const quoted: string[] = [];

      while (index < lines.length && QUOTED.test(lines[index])) {
        quoted.push((QUOTED.exec(lines[index]) as RegExpExecArray)[1]);
        index++;
      }

      const key: string = `${path}-q${nodes.length}`;

      nodes.push(
        <blockquote key={key} style={QUOTE_STYLE}>
          {formatted(quoted.join("\n"), key)}
        </blockquote>,
      );

      continue;
    }

    if (RULE.test(line)) {
      flushWords();
      nodes.push(<hr key={`${path}-r${nodes.length}`} style={RULE_STYLE} />);
      index++;

      continue;
    }

    words.push(line);
    index++;
  }

  flushWords();

  return nodes;
};

/**
 * The words of a chat message, with its lines kept. On the channels that use
 * marks, *bold*, _italic_, ~struck~ and `code` show as such, and so do the
 * lists, quotes and rules written in the editor.
 */
export default function ChatText({ text, isFormatted = false }: Props) {
  return isFormatted ? (
    <div style={{ wordBreak: "break-word" }}>{blocks(text, "m")}</div>
  ) : (
    <div style={TEXT_STYLE}>{text}</div>
  );
}
