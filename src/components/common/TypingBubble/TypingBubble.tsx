"use client";

import { theme } from "antd";

interface Props {
  // Said beside the dots ("typing…"), so nobody has to guess what they mean.
  label: string;
}

// "Someone is writing": three dots taking turns, in a bubble like the ones the
// other side's messages come in. People who asked their system for less motion
// get the dots standing still.
export default function TypingBubble({ label }: Props) {
  const { token } = theme.useToken();

  return (
    <div className="flex w-full justify-start" role="status" aria-label={label}>
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-md px-3 py-2.5 shadow-sm"
        style={{ background: token.colorBgContainer }}
      >
        {[0, 1, 2].map((dot: number) => (
          <span
            key={dot}
            aria-hidden
            className="inline-block h-2 w-2 rounded-full motion-safe:animate-bounce"
            style={{
              background: token.colorPrimary,
              animationDelay: `${dot * 150}ms`,
            }}
          />
        ))}

        <span
          className="ml-1.5 text-xs italic"
          style={{ color: token.colorTextSecondary }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
