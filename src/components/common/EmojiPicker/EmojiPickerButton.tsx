"use client";

import { Button, Popover } from "antd";

import { SmileOutlined } from "@ant-design/icons";

import EmojiPanel from "./EmojiPanel";

interface Props {
  label: string;
  disabled?: boolean;
  onPick: (emoji: string) => void;
}

// A button that opens a small emoji picker. It stays open after a pick, so
// several can go in a row; where the emoji lands is up to who uses it.
export default function EmojiPickerButton({ label, disabled, onPick }: Props) {
  return (
    <Popover
      trigger="click"
      placement="topLeft"
      content={<EmojiPanel onPick={onPick} />}
    >
      <Button
        type="text"
        shape="circle"
        size="large"
        icon={<SmileOutlined />}
        disabled={disabled}
        aria-label={label}
        title={label}
      />
    </Popover>
  );
}
