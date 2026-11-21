"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "antd";

import { DownOutlined } from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";

// How far from the end the reader must be before the button is worth showing.
const FAR_FROM_END_PX: number = 240;

// A button that takes a conversation back to its newest message. It goes as
// the last child of the element that scrolls: it floats over the bottom right
// corner, takes no room among the messages, and shows only while the reader is
// away from the end.
export default function ScrollToBottomButton() {
  const { t } = useLanguageData();

  const anchor = useRef<HTMLDivElement | null>(null);

  const [isFarFromEnd, setIsFarFromEnd] = useState<boolean>(false);

  useEffect(() => {
    const scroller: HTMLElement | null = anchor.current?.parentElement ?? null;

    if (!scroller) {
      return;
    }

    const check = (): void =>
      setIsFarFromEnd(
        scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight >
          FAR_FROM_END_PX,
      );

    check();

    scroller.addEventListener("scroll", check, { passive: true });

    return () => scroller.removeEventListener("scroll", check);
  }, []);

  const goToEnd = (): void => {
    const scroller: HTMLElement | null = anchor.current?.parentElement ?? null;

    scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  };

  return (
    <div ref={anchor} className="sticky bottom-0 z-10 h-0 self-end">
      {isFarFromEnd && (
        <Button
          shape="circle"
          icon={<DownOutlined />}
          className="!absolute bottom-1 right-0 shadow-md"
          onClick={goToEnd}
          aria-label={t("chats.scrollToBottom")}
          title={t("chats.scrollToBottom")}
        />
      )}
    </div>
  );
}
