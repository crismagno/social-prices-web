"use client";

import { ReactNode } from "react";

import { ColorPicker, Form, InputNumber, Slider } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";

interface IColorFieldProps {
  label: ReactNode;
  value: string | null;
  onChange: (color: string | null) => void;
  /** What an empty colour shows: the site's or the template's own. */
  emptyLabel?: string;
}

/** A colour that may be left empty, so the site's own is used. */
export const ColorField = ({
  label,
  value,
  onChange,
  emptyLabel,
}: IColorFieldProps) => {
  const { t } = useLanguageData();

  return (
    <Form.Item label={label}>
      <ColorPicker
        allowClear
        disabledAlpha
        value={value ?? undefined}
        showText={() =>
          value ?? emptyLabel ?? t("storeSite.editor.pages.colorOfSite")
        }
        onChangeComplete={(picked) =>
          onChange(picked.toHexString().slice(0, 7))
        }
        onClear={() => onChange(null)}
      />
    </Form.Item>
  );
};

interface IPixelsFieldProps {
  label: ReactNode;
  value: number | null;
  /** Shown, and where the slider rests, while no value was chosen. */
  fallback: number;
  limits: { readonly min: number; readonly max: number };
  step?: number;
  onChange: (pixels: number | null) => void;
  extra?: ReactNode;
}

/** A size in pixels: a slider and the number beside it. */
export const PixelsField = ({
  label,
  value,
  fallback,
  limits,
  step = 1,
  onChange,
  extra,
}: IPixelsFieldProps) => (
  <Form.Item label={label} extra={extra}>
    <div className="flex items-center gap-3">
      <Slider
        className="flex-1"
        min={limits.min}
        max={limits.max}
        step={step}
        value={value ?? fallback}
        onChange={(next: number) => onChange(next)}
      />
      <InputNumber
        className="w-24"
        min={limits.min}
        max={limits.max}
        step={step}
        addonAfter="px"
        value={value ?? fallback}
        onChange={(next: number | null) => onChange(next)}
      />
    </div>
  </Form.Item>
);
