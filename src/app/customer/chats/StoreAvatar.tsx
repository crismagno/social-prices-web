"use client";

import { useEffect, useState } from "react";

import { Avatar } from "antd";

import { IStoreChatStoreCard } from "../../../shared/business/store-chat/store-chat.types";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import ImagesEnum from "../../../shared/utils/images/images.enum";

interface Props {
  store: Pick<IStoreChatStoreCard, "logo" | "name"> | null;
  size?: number;
}

// The green of the default store picture, for what glows around it.
export const STORE_GREEN: string = "#059669";

const DEFAULT_IMAGE: string = ImagesEnum.FilesNames.DefaultStoreImage;

// A store's picture: its logo, or the platform's default store image when it
// has none or the logo fails to load. Rounded like an app tile, not a circle,
// so a store never looks like a person.
export default function StoreAvatar({ store, size = 44 }: Props) {
  const logo: string = store?.logo ? getImageUrl(store.logo) : "";

  const [src, setSrc] = useState<string>(logo || DEFAULT_IMAGE);

  useEffect(() => {
    setSrc(logo || DEFAULT_IMAGE);
  }, [logo]);

  return (
    <Avatar
      shape="square"
      size={size}
      src={src}
      alt={store?.name ?? ""}
      className="shrink-0"
      style={{
        borderRadius: size * 0.28,
        background: "transparent",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
      }}
      onError={() => {
        setSrc(DEFAULT_IMAGE);

        // The default image is shown instead of antd's empty fallback.
        return false;
      }}
    />
  );
}
