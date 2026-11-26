// Puts `emoji` where the cursor of `element` is (over what is selected), or at
// the end when there is no cursor. Nothing happens when it would not fit.
export const insertEmoji = (
  element: HTMLTextAreaElement | null | undefined,
  text: string,
  emoji: string,
  maxLength: number,
  setText: (next: string) => void,
): void => {
  const start: number = element?.selectionStart ?? text.length;

  const end: number = element?.selectionEnd ?? text.length;

  const next: string = text.slice(0, start) + emoji + text.slice(end);

  if (next.length > maxLength) {
    return;
  }

  setText(next);

  // After the new text is drawn, the cursor goes right after the emoji.
  requestAnimationFrame(() => {
    element?.focus();
    element?.setSelectionRange(start + emoji.length, start + emoji.length);
  });
};
