"use client";

import { useEffect, useState } from "react";

import {
  ColorPicker,
  Divider,
  Form,
  Input,
  Segmented,
  Space,
  Switch,
} from "antd";

import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  BLOCK_LIMITS,
  IStoreSiteBlock,
  IStoreSiteBlockItem,
  maxItemsOf,
  newBlockItem,
} from "../../../shared/business/store-sites/store-site-blocks";
import {
  IStoreSiteMarqueeStyle,
  MARQUEE_SEPARATORS,
  MARQUEE_SEPARATOR_MAX,
  siteMarqueeStyleOf,
} from "../../../shared/business/store-sites/store-site-marquee-style";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";

interface Props {
  /** A strip with content of its own (see ownPartOf). */
  block: IStoreSiteBlock;
  /** Applied to the block as it is then. */
  onChange: (
    change: (block: IStoreSiteBlock) => Partial<IStoreSiteBlock>,
  ) => void;
}

const phrasesOf = (block: IStoreSiteBlock): string =>
  block.items.map((item: IStoreSiteBlockItem) => item.title ?? "").join("\n");

/**
 * One strip of phrases: what it says, one phrase per line, and how it looks
 * and runs. Each strip on the site has its own.
 */
const MarqueeFields = ({ block, onChange }: Props) => {
  const { t } = useLanguageData();

  const marqueeStyle: IStoreSiteMarqueeStyle = siteMarqueeStyleOf(
    block.settings.marquee,
  );

  // The text as typed, empty lines and all: the block keeps only the phrases.
  const [phrases, setPhrasesState] = useState<string>(phrasesOf(block));

  // Another strip picked: its own phrases.
  useEffect(() => {
    setPhrasesState(phrasesOf(block));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.key]);

  const setPhrases = (text: string): void => {
    setPhrasesState(text);

    const lines: string[] = text
      .split("\n")
      .map((line: string) => line.trim().slice(0, BLOCK_LIMITS.itemTitle))
      .filter(Boolean)
      .slice(0, maxItemsOf(block.type));

    onChange((current: IStoreSiteBlock) => ({
      // A phrase that did not change keeps its item.
      items: lines.map((line: string, index: number): IStoreSiteBlockItem => ({
        ...(current.items[index] ?? newBlockItem(current.type)),
        title: line,
      })),
      settings: { ...current.settings, isOwn: true },
    }));
  };

  const setStyle = (patch: Partial<IStoreSiteMarqueeStyle>): void =>
    onChange((current: IStoreSiteBlock) => ({
      settings: {
        ...current.settings,
        isOwn: true,
        marquee: siteMarqueeStyleOf({ ...current.settings.marquee, ...patch }),
      },
    }));

  const isOwnSeparator: boolean =
    !!marqueeStyle.separator &&
    !MARQUEE_SEPARATORS.includes(marqueeStyle.separator);

  return (
    <Form layout="vertical">
      <Form.Item
        label={t("storeSite.editor.marquee.items")}
        extra={t("storeSite.editor.marquee.itemsHint")}
      >
        <Input.TextArea
          rows={5}
          value={phrases}
          onChange={(event) => setPhrases(event.target.value)}
        />
      </Form.Item>

      <>
        <Divider orientation="left" plain>
          {t("storeSite.editor.marquee.style.title")}
        </Divider>
        <Form.Item label={t("storeSite.editor.marquee.style.speed")}>
          <Segmented<StoreSitesEnum.MarqueeSpeed>
            value={marqueeStyle.speed}
            onChange={(speed) => setStyle({ speed })}
            options={Object.values(StoreSitesEnum.MarqueeSpeed).map(
              (speed: StoreSitesEnum.MarqueeSpeed) => ({
                value: speed,
                label: t(`storeSite.editor.marquee.style.speeds.${speed}`),
              }),
            )}
          />
        </Form.Item>
        <Form.Item label={t("storeSite.editor.marquee.style.direction")}>
          <Segmented<StoreSitesEnum.MarqueeDirection>
            value={marqueeStyle.direction}
            onChange={(direction) => setStyle({ direction })}
            options={[
              {
                value: StoreSitesEnum.MarqueeDirection.LEFT,
                icon: <ArrowLeftOutlined />,
                label: t("storeSite.editor.marquee.style.directions.LEFT"),
              },
              {
                value: StoreSitesEnum.MarqueeDirection.RIGHT,
                icon: <ArrowRightOutlined />,
                label: t("storeSite.editor.marquee.style.directions.RIGHT"),
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          label={t("storeSite.editor.marquee.style.separator")}
          extra={t("storeSite.editor.marquee.style.separatorHint")}
        >
          <Space direction="vertical" className="w-full">
            <Segmented<string>
              value={
                isOwnSeparator ? "__own__" : (marqueeStyle.separator ?? "")
              }
              onChange={(value) =>
                setStyle({
                  separator:
                    value === "__own__"
                      ? (marqueeStyle.separator ?? "+")
                      : value || null,
                })
              }
              options={[
                {
                  value: "",
                  label: t("storeSite.editor.marquee.style.templateSeparator"),
                },
                ...MARQUEE_SEPARATORS.map((separator: string) => ({
                  value: separator,
                  label: separator,
                })),
                {
                  value: "__own__",
                  label: t("storeSite.editor.marquee.style.ownSeparator"),
                },
              ]}
              style={{
                flexWrap: "wrap",
                display: "inline-flex",
                maxWidth: "100%",
              }}
            />
            {isOwnSeparator && (
              <Input
                maxLength={MARQUEE_SEPARATOR_MAX}
                value={marqueeStyle.separator ?? ""}
                onChange={(event) =>
                  setStyle({ separator: event.target.value || null })
                }
                style={{ width: 120 }}
              />
            )}
          </Space>
        </Form.Item>
        <Form.Item label={t("storeSite.editor.marquee.style.size")}>
          <Segmented<StoreSitesEnum.MarqueeSize>
            value={marqueeStyle.size}
            onChange={(size) => setStyle({ size })}
            options={Object.values(StoreSitesEnum.MarqueeSize).map(
              (size: StoreSitesEnum.MarqueeSize) => ({
                value: size,
                label: t(`storeSite.editor.marquee.style.sizes.${size}`),
              }),
            )}
          />
        </Form.Item>
        <Space size={24} wrap>
          <Form.Item
            label={t("storeSite.editor.marquee.style.background")}
            extra={t("storeSite.editor.marquee.style.colorHint")}
          >
            <ColorPicker
              allowClear
              disabledAlpha
              value={marqueeStyle.background}
              onChangeComplete={(color) =>
                setStyle({ background: color.toHexString().slice(0, 7) })
              }
              onClear={() => setStyle({ background: null })}
            />
          </Form.Item>
          <Form.Item label={t("storeSite.editor.marquee.style.color")}>
            <ColorPicker
              allowClear
              disabledAlpha
              value={marqueeStyle.color}
              onChangeComplete={(color) =>
                setStyle({ color: color.toHexString().slice(0, 7) })
              }
              onClear={() => setStyle({ color: null })}
            />
          </Form.Item>
        </Space>
        <Form.Item label={t("storeSite.editor.marquee.style.pause")}>
          <Switch
            checked={marqueeStyle.pauseOnHover}
            onChange={(pauseOnHover: boolean) => setStyle({ pauseOnHover })}
          />
        </Form.Item>
      </>
    </Form>
  );
};

export default MarqueeFields;
