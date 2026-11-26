"use client";

import { useState } from "react";

import styles from "./EmojiPanel.module.css";
import { EMOJI_GROUPS, IEmojiGroup } from "./emojis";

interface Props {
  onPick: (emoji: string) => void;
}

// The emojis by group, with no library behind it: the panel shows it in a
// popover, a store site in its own window.
export default function EmojiPanel({ onPick }: Props) {
  const [groupKey, setGroupKey] = useState<string>(EMOJI_GROUPS[0].key);

  const group: IEmojiGroup =
    EMOJI_GROUPS.find((item: IEmojiGroup) => item.key === groupKey) ??
    EMOJI_GROUPS[0];

  // The text box keeps the focus, and with it the place of the cursor.
  const keepFocus = (event: React.MouseEvent): void => event.preventDefault();

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        {EMOJI_GROUPS.map((item: IEmojiGroup) => (
          <button
            key={item.key}
            type="button"
            className={styles.tab}
            aria-pressed={item.key === group.key}
            onMouseDown={keepFocus}
            onClick={() => setGroupKey(item.key)}
          >
            {item.icon}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {group.emojis.map((emoji: string) => (
          <button
            key={emoji}
            type="button"
            className={styles.emoji}
            onMouseDown={keepFocus}
            onClick={() => onPick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
