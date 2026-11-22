"use client";

import { Form, InputNumber, Space } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import ImageField from "./ImageField";

interface Props {
  storeId: string;
  /** The images after the first one, in the order they are shown. */
  images: string[];
  /** Whether the first image was chosen: extra ones only make sense after it. */
  hasFirst: boolean;
  seconds: number | null | undefined;
  label: string;
  hint: string;
  /** Sets (or, with null, removes) the image at that place. */
  onImageChange: (index: number, imageKey: string | null) => void;
  onSecondsChange: (seconds: number) => void;
}

/**
 * More images after the first one, to take turns like a slider, and how long
 * each one stays. Each upload opens an empty field for the next.
 */
const ExtraImagesField = ({
  storeId,
  images,
  hasFirst,
  seconds,
  label,
  hint,
  onImageChange,
  onSecondsChange,
}: Props) => {
  const { t } = useLanguageData();

  const isFull: boolean = images.length >= StoreSitesEnum.MAX_HERO_EXTRA_IMAGES;

  return (
    <>
      <Form.Item label={label} extra={hint}>
        <Space direction="vertical" className="w-full">
          {images.map((imageKey: string, index: number) => (
            <ImageField
              key={`${index}-${imageKey}`}
              storeId={storeId}
              value={imageKey}
              onChange={(next) => onImageChange(index, next)}
            />
          ))}
          <ImageField
            // A new, empty field each time one is filled.
            key={`new-${images.length}`}
            storeId={storeId}
            value={null}
            disabled={!hasFirst || isFull}
            onChange={(next) => next && onImageChange(images.length, next)}
          />
        </Space>
      </Form.Item>
      {images.length > 0 && (
        <Form.Item label={t("storeSite.editor.hero.slides.seconds")}>
          <InputNumber
            min={StoreSitesEnum.MIN_SLIDE_SECONDS}
            max={StoreSitesEnum.MAX_SLIDE_SECONDS}
            precision={0}
            addonAfter="s"
            value={seconds ?? StoreSitesEnum.DEFAULT_SLIDE_SECONDS}
            onChange={(value: number | null) =>
              onSecondsChange(value ?? StoreSitesEnum.DEFAULT_SLIDE_SECONDS)
            }
          />
        </Form.Item>
      )}
    </>
  );
};

export default ExtraImagesField;
