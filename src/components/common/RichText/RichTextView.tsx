"use client";

import { useEffect, useState } from "react";

import DOMPurify from "dompurify";

import { isRichText } from "../../../shared/utils/rich-text/rich-text";
import styles from "./RichText.module.css";

interface Props {
  value: string | null | undefined;
  className?: string;
}

// The same tags the API keeps: anything else is dropped once more here.
const ALLOWED_TAGS: string[] = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "mark",
  "code",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  "a",
];

const ALLOWED_ATTR: string[] = ["href", "style", "start"];

// A link always opens apart and tells nothing of where it came from: set
// here, after the cleaning, the same way the API sets it.
let isLinkHookSet: boolean = false;

const setLinkHook = (): void => {
  if (isLinkHookSet) {
    return;
  }

  isLinkHookSet = true;

  DOMPurify.addHook("afterSanitizeAttributes", (node: Element) => {
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer nofollow");
    }
  });
};

/**
 * A description or details as they were written: formatted when they came
 * from the editor, as typed (line breaks kept) when they are plain. The API
 * cleans what it keeps; the browser cleans it again before drawing it.
 */
export default function RichTextView({ value, className }: Props) {
  const isRich: boolean = isRichText(value);

  // The server draws what the API sent; the browser, once it can, what is left
  // after its own cleaning. Both start the same, so the page does not jump.
  const [html, setHtml] = useState<string>(isRich ? (value ?? "") : "");

  useEffect(() => {
    if (isRich) {
      setLinkHook();
      setHtml(
        DOMPurify.sanitize(value ?? "", {
          ALLOWED_TAGS,
          ALLOWED_ATTR,
          ALLOWED_URI_REGEXP: /^(https?:|mailto:|tel:)/i,
        }),
      );
    }
  }, [isRich, value]);

  if (!value?.trim()) {
    return null;
  }

  return isRich ? (
    <div
      className={`${styles.rich} ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <div className={`${styles.plain} ${className ?? ""}`}>{value}</div>
  );
}
