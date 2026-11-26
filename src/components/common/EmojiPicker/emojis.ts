// A short, hand-picked set: enough for a chat with customers without bringing in a library.
export interface IEmojiGroup {
  key: string;
  icon: string;
  emojis: string[];
}

const split = (emojis: string): string[] => emojis.split(" ");

export const EMOJI_GROUPS: IEmojiGroup[] = [
  {
    key: "smileys",
    icon: "😀",
    emojis: split(
      "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 😴 😷 🤒 🤕 🤢 🤧 🥵 🥶 🥳 😎 🤓 😕 😟 🙁 😮 😯 😲 😳 🥺 😢 😭 😱 😓 😩 😤 😡 🤯",
    ),
  },
  {
    key: "gestures",
    icon: "👍",
    emojis: split(
      "👍 👎 👌 🤌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐️ 👋 🤝 👏 🙌 👐 🤲 🙏 💪 ✍️ 👀 🧠 🫶",
    ),
  },
  {
    key: "hearts",
    icon: "❤️",
    emojis: split(
      "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 ✨ ⭐ 🌟 💫 🔥 💯 🎉 🎊 🎁 🎈 🏆 🥇",
    ),
  },
  {
    key: "business",
    icon: "🛒",
    emojis: split(
      "🛒 🛍️ 💰 💵 💳 🧾 🏷️ 📦 🚚 🚀 🏪 🏬 📱 💻 📞 ☎️ 📧 ✉️ 📍 📌 📎 📝 📅 ⏰ ⌛ 🔔 🔒 🔑 📷 🎥 📈 📉 📊",
    ),
  },
  {
    key: "food",
    icon: "🍕",
    emojis: split(
      "☕ 🍵 🥤 🍺 🍷 🥂 🍕 🍔 🍟 🌭 🥪 🌮 🍣 🍝 🥗 🍰 🎂 🍫 🍩 🍪 🍎 🍌 🍓 🍇 🍉 🥑",
    ),
  },
  {
    key: "symbols",
    icon: "✅",
    emojis: split(
      "✅ ☑️ ✔️ ❌ ❎ ⚠️ ❗ ❓ ⛔ 🚫 ➕ ➖ ➡️ ⬅️ ⬆️ ⬇️ 🔄 🆗 🆕 🆓 🔝 💬 👉 ☀️ 🌙 ☔ ⚡ 🌈",
    ),
  },
];
