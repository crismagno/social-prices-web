"use client";

import { ReactNode } from "react";

import { Collapse, theme } from "antd";

import {
  CheckCircleFilled,
  InfoCircleFilled,
  QuestionCircleOutlined,
} from "@ant-design/icons";

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

// A short list that tells the user what to have, or what to expect, before and
// while connecting. `kind` picks the marker: a check for what is needed or what
// the app does, an info mark for what is good to know.
export function ConnectChecklist({
  title,
  items,
  accentColor,
  kind = "check",
}: {
  title: string;
  items: string[];
  accentColor: string;
  kind?: "check" | "info";
}) {
  const { token } = theme.useToken();

  return (
    <section
      className="mt-6 rounded-xl p-4"
      style={{
        background: `color-mix(in srgb, ${accentColor} 7%, transparent)`,
        border: `1px solid color-mix(in srgb, ${accentColor} 22%, transparent)`,
      }}
    >
      <h3 className="m-0 mb-2 text-sm font-semibold">{title}</h3>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {items.map((item: string, index: number) => (
          <li key={index} className="flex items-start gap-2">
            <span
              className="mt-[3px] shrink-0"
              style={{ color: accentColor }}
              aria-hidden="true"
            >
              {kind === "check" ? <CheckCircleFilled /> : <InfoCircleFilled />}
            </span>

            <span style={{ color: token.colorTextSecondary }}>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// The questions a person asks before trusting an app with their account.
export function ConnectFaq({
  title,
  items,
}: {
  title: string;
  items: { question: string; answer: string }[];
}) {
  const { token } = theme.useToken();

  return (
    <section className="mt-8">
      <h3 className="m-0 mb-1 flex items-center gap-2 text-sm font-semibold">
        <QuestionCircleOutlined />

        {title}
      </h3>

      <Collapse
        ghost
        size="small"
        items={items.map((item, index: number) => ({
          key: String(index),
          label: <span className="font-medium">{item.question}</span>,
          children: (
            <p className="m-0" style={{ color: token.colorTextSecondary }}>
              {item.answer}
            </p>
          ),
        }))}
      />
    </section>
  );
}

// A few short lines under a step: how to do it, exactly.
export function ConnectStepDetail({ items }: { items: string[] }) {
  const { token } = theme.useToken();

  return (
    <ol
      className="m-0 mb-3 list-decimal pl-5"
      style={{ color: token.colorTextSecondary }}
    >
      {items.map((item: string, index: number) => (
        <li key={index} className="pl-1">
          {item}
        </li>
      ))}
    </ol>
  );
}
