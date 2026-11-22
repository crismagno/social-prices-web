"use client";

import { useEffect, useRef, useState } from "react";

import { Segmented } from "antd";

import { DesktopOutlined, MobileOutlined } from "@ant-design/icons";

import {
  IPreviewData,
  IPreviewMessage,
  PREVIEW_DATA,
  PREVIEW_READY,
} from "../../../components/store-site/preview-channel";
import useLanguageData from "../../../data/context/language/useLanguageData";
import Urls from "../../../shared/common/routes-app/routes-app";

interface Props {
  data: IPreviewData;
}

type TDevice = "desktop" | "mobile";

const DESKTOP_WIDTH = 1280;
const MOBILE_WIDTH = 390;

/**
 * The draft drawn by the real template, in a frame of its own so the template
 * answers to the frame's width (desktop or phone), not to the editor's.
 */
const SitePreview = ({ data }: Props) => {
  const { t } = useLanguageData();

  const frameRef = useRef<HTMLIFrameElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);

  const [device, setDevice] = useState<TDevice>("desktop");
  const [isReady, setIsReady] = useState<boolean>(false);
  const [holderWidth, setHolderWidth] = useState<number>(0);

  useEffect(() => {
    const onMessage = (event: MessageEvent<IPreviewMessage>): void => {
      if (
        event.origin === window.location.origin &&
        event.source === frameRef.current?.contentWindow &&
        event.data?.type === PREVIEW_READY
      ) {
        setIsReady(true);
      }
    };

    window.addEventListener("message", onMessage);

    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    // A short wait so typing does not redraw the frame on every key.
    const timer: number = window.setTimeout(
      () =>
        frameRef.current?.contentWindow?.postMessage(
          { type: PREVIEW_DATA, data } as IPreviewMessage,
          window.location.origin,
        ),
      150,
    );

    return () => window.clearTimeout(timer);
  }, [data, isReady]);

  useEffect(() => {
    const holder: HTMLDivElement | null = holderRef.current;

    if (!holder || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer: ResizeObserver = new ResizeObserver(() =>
      setHolderWidth(holder.clientWidth),
    );

    observer.observe(holder);
    setHolderWidth(holder.clientWidth);

    return () => observer.disconnect();
  }, []);

  const frameWidth: number =
    device === "desktop" ? DESKTOP_WIDTH : MOBILE_WIDTH;

  // The desktop frame is wider than the pane: it is shown scaled down.
  const scale: number =
    holderWidth > 0 ? Math.min(1, holderWidth / frameWidth) : 1;

  const frameHeight: number = 720 / scale;

  return (
    <div>
      <div className="flex justify-end mb-2">
        <Segmented<TDevice>
          value={device}
          onChange={setDevice}
          options={[
            {
              value: "desktop",
              icon: <DesktopOutlined />,
              label: t("storeSite.editor.desktop"),
            },
            {
              value: "mobile",
              icon: <MobileOutlined />,
              label: t("storeSite.editor.mobile"),
            },
          ]}
        />
      </div>
      <div
        ref={holderRef}
        className="rounded-lg border overflow-hidden bg-gray-100 dark:bg-gray-800"
        style={{ height: 720 }}
      >
        <iframe
          ref={frameRef}
          src={Urls.SITE_PREVIEW}
          title={t("storeSite.editor.preview")}
          style={{
            width: frameWidth,
            height: frameHeight,
            border: 0,
            display: "block",
            margin: "0 auto",
            transform: `scale(${scale})`,
            transformOrigin: scale < 1 ? "top left" : "top center",
            background: "#fff",
          }}
        />
      </div>
    </div>
  );
};

export default SitePreview;
