"use client";

import { useState } from "react";

import { Button, Input } from "antd";
import dayjs from "dayjs";

import useLanguageData from "../../data/context/language/useLanguageData";

interface Props {
  // The words as they are now; empty for a file sent without a caption.
  initialText: string;
  maxLength: number;
  // Resolves when the new words were kept. A refusal is thrown: the editor
  // stays open so nothing typed is lost.
  onSave: (text: string) => Promise<void>;
  onCancel: () => void;
}

// The words of a message being changed, in the place of the message itself.
// Enter saves, Shift+Enter breaks the line, Esc gives up. Used by every thread
// that lets a message already sent be corrected.
export default function ChatsMessageEditor({
  initialText,
  maxLength,
  onSave,
  onCancel,
}: Props) {
  const { t } = useLanguageData();

  const [text, setText] = useState<string>(initialText);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const body: string = text.trim();

  const canSave: boolean = !!body && body !== initialText.trim() && !isSaving;

  const save = async (): Promise<void> => {
    if (!canSave) {
      return;
    }

    try {
      setIsSaving(true);

      await onSave(body);
    } catch {
      // Whoever was asked to save already said why it did not go.
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-[min(60vw,22rem)] flex-col gap-2">
      <Input.TextArea
        autoFocus
        value={text}
        maxLength={maxLength}
        autoSize={{ minRows: 1, maxRows: 8 }}
        disabled={isSaving}
        placeholder={t("chats.edit.placeholder")}
        aria-label={t("chats.edit.action")}
        onChange={(event) => setText(event.target.value)}
        // The caret starts after the last word, not before the first.
        onFocus={(event) => {
          const end: number = event.target.value.length;

          event.target.setSelectionRange(end, end);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          } else if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            save();
          }
        }}
      />

      <div className="flex justify-end gap-2">
        <Button size="small" disabled={isSaving} onClick={onCancel}>
          {t("common.cancel")}
        </Button>

        <Button
          size="small"
          type="primary"
          loading={isSaving}
          disabled={!canSave}
          onClick={save}
        >
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
}

// Next to the time of a message whose words were changed after it was sent.
export function ChatsEditedMark({ editedAt }: { editedAt?: string | null }) {
  const { t } = useLanguageData();

  if (!editedAt) {
    return null;
  }

  return (
    <span
      className="italic"
      title={`${t("chats.edit.editedAt")} ${dayjs(editedAt).format("DD/MM/YYYY HH:mm")}`}
    >
      {t("chats.edit.edited")}
    </span>
  );
}
