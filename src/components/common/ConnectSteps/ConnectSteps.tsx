"use client";

import { ReactNode } from "react";

import { theme } from "antd";

// The first screen of an app: who it is, and the way in as a sequence of steps.
// Each app brings its own accent color (its brand) and its own steps.

interface HeroProps {
  icon: ReactNode;
  accentColor: string;
  title: string;
  subtitle: string;
}

// The app's icon on a soft tint of its own color.
export function AppTile({
  icon,
  accentColor,
  size = 64,
}: {
  icon: ReactNode;
  accentColor: string;
  size?: number;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-2xl"
      style={{
        width: size,
        height: size,
        background: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
        fontSize: Math.round(size * 0.62),
      }}
    >
      {icon}
    </span>
  );
}

export function ConnectHero({ icon, accentColor, title, subtitle }: HeroProps) {
  const { token } = theme.useToken();

  return (
    <div className="flex items-center gap-4">
      <AppTile icon={icon} accentColor={accentColor} />

      <div className="min-w-0">
        <h2 className="m-0 text-xl font-semibold leading-tight">{title}</h2>

        <p className="m-0 mt-1" style={{ color: token.colorTextSecondary }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export function ConnectSteps({ children }: { children: ReactNode }) {
  return <ol className="m-0 mt-8 list-none p-0">{children}</ol>;
}

interface StepProps {
  position: number;
  title: string;
  accentColor: string;
  // The step that happens in this system: its marker is filled.
  isCurrent?: boolean;
  isLast?: boolean;
  children: ReactNode;
}

export function ConnectStep({
  position,
  title,
  accentColor,
  isCurrent,
  isLast,
  children,
}: StepProps) {
  const { token } = theme.useToken();

  return (
    <li className="flex gap-4" aria-current={isCurrent ? "step" : undefined}>
      <div className="flex flex-col items-center">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{
            background: isCurrent ? accentColor : "transparent",
            color: isCurrent ? "#fff" : accentColor,
            border: `2px solid ${accentColor}`,
          }}
        >
          {position}
        </span>

        {!isLast && (
          <span
            className="my-1 w-px flex-1"
            style={{ background: token.colorBorder }}
          />
        )}
      </div>

      <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-6"}`}>
        <div className="text-base font-semibold leading-8">{title}</div>

        {children}
      </div>
    </li>
  );
}

// The explaining line under a step's title.
export function ConnectStepText({ children }: { children: ReactNode }) {
  const { token } = theme.useToken();

  return (
    <p className="m-0 mb-3" style={{ color: token.colorTextSecondary }}>
      {children}
    </p>
  );
}
