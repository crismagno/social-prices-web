"use client";

import { theme } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import StoreAvatar, { STORE_GREEN } from "./StoreAvatar";

const TILE: number = 112;

interface Props {
  // True when the customer has not talked to any store yet.
  isEmpty: boolean;
}

// What the right side shows with no conversation open: the store picture on a
// tile with a soft glow, the same composition the stores' chat uses.
export default function CustomerChatsEmptyState({ isEmpty }: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: TILE * 1.6, height: TILE * 1.6 }}
      >
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${STORE_GREEN}33 0%, ${STORE_GREEN}00 70%)`,
          }}
        />

        <div
          aria-hidden
          className="relative flex items-center justify-center"
          style={{
            width: TILE,
            height: TILE,
            borderRadius: TILE * 0.28,
            background: token.colorBgContainer,
            boxShadow: `0 10px 30px ${STORE_GREEN}40, 0 0 0 1px ${token.colorBorderSecondary}`,
          }}
        >
          <StoreAvatar store={null} size={TILE * 0.66} />
        </div>
      </div>

      <div className="text-lg font-semibold">
        {t(isEmpty ? "customerChats.emptyTitle" : "customerChats.pickTitle")}
      </div>

      <div className="max-w-sm" style={{ color: token.colorTextSecondary }}>
        {t(isEmpty ? "customerChats.noConversations" : "customerChats.pick")}
      </div>
    </div>
  );
}
