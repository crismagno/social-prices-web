// Telegram's own blue. It carries the brand across the whole Telegram app: the
// icon, the controls, and the messages we send.
export const TELEGRAM_BLUE: string = "#229ED9";

// The palette Telegram itself uses for people without a photo.
const AVATAR_COLORS: string[] = [
  "#E17076",
  "#7BC862",
  "#E5CA77",
  "#65AADD",
  "#A695E7",
  "#EE7AAE",
  "#6EC9CB",
  "#FAA774",
];

// The same person always gets the same color.
export const avatarColor = (seed: number): string =>
  AVATAR_COLORS[Math.abs(Math.trunc(seed)) % AVATAR_COLORS.length];
