"use client";

import { useEffect, useState } from "react";

import { theme } from "antd";

import AppIcon from "../../components/common/AppIcon/AppIcon";
import useLanguageData from "../../data/context/language/useLanguageData";
import InboxEnum from "../../shared/business/inbox/inbox.enum";
import { CHANNEL_COLOR } from "./chats-display";

const CHANNELS: InboxEnum.Channel[] = Object.values(InboxEnum.Channel);
const CYCLE_MS: number = 2400;
const TILE: number = 112;

interface Props {
  // True when there are no conversations at all, so the text explains what shows up here.
  isEmpty: boolean;
}

// What the right side shows with no conversation open: the icons of the channels
// taking turns on one tile, the tile's glow following the color of the one in front.
export default function ChatsEmptyState({ isEmpty }: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const [active, setActive] = useState<number>(0);

  useEffect(() => {
    // Whoever asked their system for less motion gets the first icon, still.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = setInterval(
      () => setActive((current: number) => (current + 1) % CHANNELS.length),
      CYCLE_MS,
    );

    return () => clearInterval(interval);
  }, []);

  const color: string = CHANNEL_COLOR[CHANNELS[active]];

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
            background: `radial-gradient(circle, ${color}33 0%, ${color}00 70%)`,
            transition: "background 700ms ease",
          }}
        />

        <div
          className="relative"
          style={{
            width: TILE,
            height: TILE,
            borderRadius: TILE * 0.28,
            background: token.colorBgContainer,
            boxShadow: `0 10px 30px ${color}40, 0 0 0 1px ${token.colorBorderSecondary}`,
            transition: "box-shadow 700ms ease",
          }}
        >
          {CHANNELS.map((channel: InboxEnum.Channel, index: number) => {
            const offset: number =
              (index - active + CHANNELS.length) % CHANNELS.length;

            // In front, or waiting just behind it, or on its way out.
            const isActive: boolean = offset === 0;

            return (
              <span
                key={channel}
                aria-hidden
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  fontSize: TILE * 0.58,
                  opacity: isActive ? 1 : 0,
                  transform: isActive
                    ? "scale(1) rotate(0deg)"
                    : offset === CHANNELS.length - 1
                      ? "scale(0.6) rotate(-18deg)"
                      : "scale(0.6) rotate(18deg)",
                  transition:
                    "opacity 600ms ease, transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <AppIcon app={InboxEnum.ChannelApp[channel]} />
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2" aria-hidden>
        {CHANNELS.map((channel: InboxEnum.Channel, index: number) => (
          <span
            key={channel}
            className="rounded-full"
            style={{
              height: 6,
              width: index === active ? 22 : 6,
              background: index === active ? color : token.colorFillSecondary,
              transition: "all 400ms ease",
            }}
          />
        ))}
      </div>

      {isEmpty ? (
        <>
          <div className="text-lg font-semibold">{t("chats.empty.title")}</div>

          <div className="max-w-sm" style={{ color: token.colorTextSecondary }}>
            {t("chats.empty.text")}
          </div>
        </>
      ) : (
        <>
          <div className="text-lg font-semibold">{t("chats.pick")}</div>

          <div className="max-w-sm" style={{ color: token.colorTextSecondary }}>
            {t("chats.pickHint")}
          </div>
        </>
      )}
    </div>
  );
}
