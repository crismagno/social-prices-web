"use client";

import {
  Button,
  Card,
  ColorPicker,
  Form,
  Input,
  InputNumber,
  Segmented,
  Slider,
  Space,
  Switch,
  Tooltip,
} from "antd";

import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import RichTextEditor from "../../../components/common/RichText/RichTextEditor";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { embedUrlOf } from "../../../shared/business/store-sites/store-site-about";
import {
  IStoreSiteBlock,
  newBlockButton,
} from "../../../shared/business/store-sites/store-site-blocks";
import {
  CANVAS_LIMITS,
  IStoreSiteCanvas,
  IStoreSiteCanvasElement,
  boxWithin,
  newCanvasElement,
} from "../../../shared/business/store-sites/store-site-canvas";
import { IStoreSitePage } from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import {
  richTextToPlain,
  toRichHtml,
} from "../../../shared/utils/rich-text/rich-text";
import ButtonFields from "./ButtonFields";
import ImageField from "./ImageField";
import { MapEditor } from "./MapFields";
import ContactFormFields from "./ContactFormFields";
import { siteContactFormOf } from "../../../shared/business/store-sites/store-site-contact";
import VideoField from "./VideoField";

interface Props {
  section: IStoreSiteBlock;
  pages: IStoreSitePage[];
  storeId: string;
  /** The element picked, here or in the preview. */
  selectedElementKey: string | null;
  onSelectElement: (elementKey: string | null) => void;
  /** Applied to the section as it is then. */
  onChange: (
    change: (section: IStoreSiteBlock) => Partial<IStoreSiteBlock>,
  ) => void;
}

const KEY = "storeSite.editor.builder.canvas";

const Type = StoreSitesEnum.CanvasElementType;

type TColorKey = "color" | "background" | "borderColor";
type TBoxKey = "x" | "y" | "width" | "height";

const BOX_KEYS: TBoxKey[] = ["x", "y", "width", "height"];

/** Which kinds have words, and which have a background of their own. */
const WITH_TEXT: StoreSitesEnum.CanvasElementType[] = [
  Type.TEXT,
  Type.BUTTON,
  Type.BOX,
];

const WITH_BACKGROUND: StoreSitesEnum.CanvasElementType[] = [
  Type.TEXT,
  Type.BUTTON,
  Type.BOX,
];

/**
 * A free canvas in the panel: its height, a button for each kind of element
 * to add, the elements back to front, and everything the picked one has. Its
 * place and size can be typed here or dragged in the preview.
 */
const CanvasFields = ({
  section,
  pages,
  storeId,
  selectedElementKey,
  onSelectElement,
  onChange,
}: Props) => {
  const { t } = useLanguageData();

  const canvas: IStoreSiteCanvas | null = section.settings.canvas;

  if (!canvas) {
    return null;
  }

  // From the section as it is when applied, like every change of the editor.
  const setCanvas = (
    change: (current: IStoreSiteCanvas) => Partial<IStoreSiteCanvas>,
  ): void =>
    onChange((current) => {
      const now: IStoreSiteCanvas = current.settings.canvas ?? canvas;

      return {
        settings: {
          ...current.settings,
          canvas: { ...now, ...change(now) },
        },
      };
    });

  const setElements = (
    change: (elements: IStoreSiteCanvasElement[]) => IStoreSiteCanvasElement[],
  ): void =>
    setCanvas((current) => ({ elements: change([...current.elements]) }));

  const setElement = (
    key: string,
    patch: Partial<IStoreSiteCanvasElement>,
  ): void =>
    setCanvas((current) => ({
      elements: current.elements.map((element: IStoreSiteCanvasElement) =>
        element.key === key
          ? {
              ...element,
              ...patch,
              // Its place and size stay inside the canvas.
              ...boxWithin({ ...element, ...patch }, current.height),
            }
          : element,
      ),
    }));

  const add = (type: StoreSitesEnum.CanvasElementType): void => {
    const element: IStoreSiteCanvasElement = newCanvasElement(
      type,
      WITH_TEXT.includes(type) && type !== Type.BOX
        ? t(`${KEY}.samples.${type}`)
        : null,
      canvas.elements.length,
      newBlockButton(),
    );

    setElements((elements) => [...elements, element]);
    onSelectElement(element.key);
  };

  const move = (from: number, to: number): void =>
    setElements((elements) => {
      elements.splice(to, 0, elements.splice(from, 1)[0]);

      return elements;
    });

  const selected: IStoreSiteCanvasElement | undefined = canvas.elements.find(
    (element: IStoreSiteCanvasElement) => element.key === selectedElementKey,
  );

  const isFull: boolean = canvas.elements.length >= CANVAS_LIMITS.elements;

  const nameOf = (element: IStoreSiteCanvasElement): string =>
    richTextToPlain(element.text).trim().slice(0, 28) ||
    t(`${KEY}.kinds.${element.type}`);

  const colorField = (element: IStoreSiteCanvasElement, name: TColorKey) => (
    <Form.Item label={t(`${KEY}.${name}`)}>
      <ColorPicker
        allowClear
        disabledAlpha
        value={element[name] ?? undefined}
        showText={() =>
          element[name] ?? t("storeSite.editor.pages.colorOfSite")
        }
        onChangeComplete={(picked) =>
          setElement(element.key, {
            [name]: picked.toHexString().slice(0, 7),
          })
        }
        onClear={() => setElement(element.key, { [name]: null })}
      />
    </Form.Item>
  );

  return (
    <Space direction="vertical" className="w-full">
      <p className="m-0 text-xs opacity-70">{t(`${KEY}.hint`)}</p>

      <Form layout="vertical">
        <Form.Item label={t(`${KEY}.height`)} className="mb-2">
          <InputNumber
            min={CANVAS_LIMITS.height[0]}
            max={CANVAS_LIMITS.height[1]}
            step={20}
            addonAfter="px"
            value={canvas.height}
            onChange={(height: number | null) =>
              setCanvas((current) => {
                const next: number = Math.min(
                  CANVAS_LIMITS.height[1],
                  Math.max(CANVAS_LIMITS.height[0], height ?? current.height),
                );

                // What no longer fits comes back inside the shorter canvas.
                return {
                  height: next,
                  elements: current.elements.map(
                    (element: IStoreSiteCanvasElement) => ({
                      ...element,
                      ...boxWithin(element, next),
                    }),
                  ),
                };
              })
            }
          />
        </Form.Item>
      </Form>

      <Card size="small" title={t(`${KEY}.add`)}>
        <div className="flex flex-wrap gap-2">
          {Object.values(Type).map((type: StoreSitesEnum.CanvasElementType) => (
            <Button
              key={type}
              size="small"
              icon={<PlusOutlined />}
              disabled={isFull}
              onClick={() => add(type)}
            >
              {t(`${KEY}.kinds.${type}`)}
            </Button>
          ))}
        </div>
      </Card>

      {canvas.elements.length > 0 && (
        <Card size="small" title={t(`${KEY}.layers`)}>
          <div className="flex flex-col gap-1">
            {/* Front first: what is listed above is drawn over what is below. */}
            {[...canvas.elements]
              .map((element, index) => ({ element, index }))
              .reverse()
              .map(({ element, index }) => (
                <div
                  key={element.key}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 cursor-pointer ${
                    element.key === selectedElementKey
                      ? "bg-blue-500/15"
                      : "hover:bg-gray-500/10"
                  }`}
                  onClick={() => onSelectElement(element.key)}
                >
                  <span className="w-16 shrink-0 text-xs opacity-60">
                    {t(`${KEY}.kinds.${element.type}`)}
                  </span>
                  <span className="flex-1 truncate">{nameOf(element)}</span>
                  <Tooltip title={t(`${KEY}.forward`)}>
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowUpOutlined />}
                      disabled={index === canvas.elements.length - 1}
                      onClick={(event) => {
                        event.stopPropagation();
                        move(index, index + 1);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={t(`${KEY}.backward`)}>
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowDownOutlined />}
                      disabled={index === 0}
                      onClick={(event) => {
                        event.stopPropagation();
                        move(index, index - 1);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={t(`${KEY}.duplicate`)}>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      disabled={isFull}
                      onClick={(event) => {
                        event.stopPropagation();

                        const copy: IStoreSiteCanvasElement = {
                          ...newCanvasElement(element.type, null, 0, null),
                          ...element,
                          key: newCanvasElement(element.type, null, 0, null)
                            .key,
                          ...boxWithin(
                            {
                              ...element,
                              x: element.x + 24,
                              y: element.y + 24,
                            },
                            canvas.height,
                          ),
                        };

                        setElements((elements) => [...elements, copy]);
                        onSelectElement(copy.key);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={t(`${KEY}.remove`)}>
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(event) => {
                        event.stopPropagation();
                        setElements((elements) =>
                          elements.filter(
                            (each: IStoreSiteCanvasElement) =>
                              each.key !== element.key,
                          ),
                        );

                        if (element.key === selectedElementKey) {
                          onSelectElement(null);
                        }
                      }}
                    />
                  </Tooltip>
                </div>
              ))}
          </div>
        </Card>
      )}

      {selected && (
        <Card
          size="small"
          title={`${t(`${KEY}.kinds.${selected.type}`)} — ${t(`${KEY}.properties`)}`}
        >
          <Form layout="vertical">
            <Form.Item label={t(`${KEY}.place`)} extra={t(`${KEY}.placeHint`)}>
              <div className="grid grid-cols-2 gap-2">
                {BOX_KEYS.map((name: TBoxKey) => (
                  <InputNumber
                    key={name}
                    className="w-full"
                    addonBefore={t(`${KEY}.box.${name}`)}
                    value={selected[name]}
                    onChange={(value: number | null) =>
                      setElement(selected.key, { [name]: value ?? 0 })
                    }
                  />
                ))}
              </div>
            </Form.Item>

            {WITH_TEXT.includes(selected.type) && (
              <>
                <Form.Item label={t(`${KEY}.text`)}>
                  {selected.type === Type.BUTTON ? (
                    <Input
                      maxLength={200}
                      value={selected.text ?? ""}
                      onChange={(event) =>
                        setElement(selected.key, {
                          text: event.target.value || null,
                        })
                      }
                    />
                  ) : (
                    // The editor of the panel: bold, lists, links, headings.
                    <RichTextEditor
                      key={selected.key}
                      value={toRichHtml(selected.text)}
                      maxLength={CANVAS_LIMITS.text}
                      onChange={(html: string) =>
                        setElement(selected.key, { text: html || null })
                      }
                    />
                  )}
                </Form.Item>
                <div className="flex flex-wrap items-end gap-x-4">
                  <Form.Item label={t(`${KEY}.fontSize`)}>
                    <InputNumber
                      min={CANVAS_LIMITS.fontSize[0]}
                      max={CANVAS_LIMITS.fontSize[1]}
                      addonAfter="px"
                      value={selected.fontSize}
                      onChange={(fontSize: number | null) =>
                        setElement(selected.key, {
                          fontSize: fontSize ?? selected.fontSize,
                        })
                      }
                    />
                  </Form.Item>
                  <Form.Item label={t(`${KEY}.bold`)}>
                    <Switch
                      checked={selected.isBold}
                      onChange={(isBold: boolean) =>
                        setElement(selected.key, { isBold })
                      }
                    />
                  </Form.Item>
                  <Form.Item label={t(`${KEY}.align`)}>
                    <Segmented<StoreSitesEnum.CanvasAlign>
                      value={selected.align}
                      onChange={(align) => setElement(selected.key, { align })}
                      options={[
                        {
                          value: StoreSitesEnum.CanvasAlign.LEFT,
                          icon: <AlignLeftOutlined />,
                        },
                        {
                          value: StoreSitesEnum.CanvasAlign.CENTER,
                          icon: <AlignCenterOutlined />,
                        },
                        {
                          value: StoreSitesEnum.CanvasAlign.RIGHT,
                          icon: <AlignRightOutlined />,
                        },
                      ]}
                    />
                  </Form.Item>
                </div>
              </>
            )}

            {selected.type === Type.MAP && selected.map && (
              <MapEditor
                map={selected.map}
                hasHeight={false}
                // From the element as it is when applied.
                setMap={(change) =>
                  setCanvas((current) => ({
                    elements: current.elements.map(
                      (element: IStoreSiteCanvasElement) =>
                        element.key === selected.key && element.map
                          ? {
                              ...element,
                              map: { ...element.map, ...change(element.map) },
                            }
                          : element,
                    ),
                  }))
                }
              />
            )}

            {selected.type === Type.FORM && (
              <ContactFormFields
                heading={t("storeSite.editor.builder.form.heading")}
                contact={siteContactFormOf(selected.form)}
                // From the element as it is when applied.
                onChange={(change) =>
                  setCanvas((current) => ({
                    elements: current.elements.map(
                      (element: IStoreSiteCanvasElement) => {
                        if (element.key !== selected.key) {
                          return element;
                        }

                        const form = siteContactFormOf(element.form);

                        return {
                          ...element,
                          form: { ...form, ...change(form) },
                        };
                      },
                    ),
                  }))
                }
              />
            )}

            {selected.type === Type.IMAGE && (
              <Form.Item label={t(`${KEY}.image`)}>
                <ImageField
                  storeId={storeId}
                  value={selected.imageUrl}
                  onChange={(imageUrl) =>
                    setElement(selected.key, { imageUrl })
                  }
                />
              </Form.Item>
            )}

            {selected.type === Type.VIDEO && (
              <>
                <Form.Item label={t(`${KEY}.videoFile`)}>
                  <VideoField
                    storeId={storeId}
                    value={
                      selected.media?.type ===
                      StoreSitesEnum.AboutMediaType.VIDEO
                        ? selected.media.url
                        : null
                    }
                    onChange={(url: string | null) =>
                      setElement(selected.key, {
                        media: url
                          ? { type: StoreSitesEnum.AboutMediaType.VIDEO, url }
                          : null,
                      })
                    }
                  />
                </Form.Item>
                <Form.Item
                  label={t(`${KEY}.video`)}
                  extra={t(`${KEY}.videoHint`)}
                >
                  <Input
                    allowClear
                    placeholder="https://www.youtube.com/watch?v=…"
                    // Emptied when a file takes the place of the link.
                    key={`${selected.key}:${selected.media?.type ?? ""}`}
                    defaultValue={
                      selected.media?.type ===
                      StoreSitesEnum.AboutMediaType.EMBED
                        ? selected.media.url
                        : ""
                    }
                    onChange={(event) => {
                      // Only a YouTube or Vimeo address becomes a player.
                      const url: string | null = embedUrlOf(event.target.value);

                      // A link that is not one leaves an uploaded file alone.
                      if (
                        !url &&
                        selected.media?.type ===
                          StoreSitesEnum.AboutMediaType.VIDEO
                      ) {
                        return;
                      }

                      setElement(selected.key, {
                        media: url
                          ? { type: StoreSitesEnum.AboutMediaType.EMBED, url }
                          : null,
                      });
                    }}
                  />
                </Form.Item>
              </>
            )}

            {selected.type === Type.BUTTON && (
              <ButtonFields
                button={selected.button}
                pages={pages}
                withoutLabel
                onChange={(patch) =>
                  setElement(selected.key, {
                    button: newBlockButton({ ...selected.button, ...patch }),
                  })
                }
              />
            )}

            <div className="flex flex-wrap gap-x-6">
              {/* A map and a form have no words or line of their own to colour. */}
              {selected.type !== Type.MAP &&
                selected.type !== Type.FORM &&
                colorField(selected, "color")}
              {WITH_BACKGROUND.includes(selected.type) &&
                colorField(selected, "background")}
              {selected.type !== Type.DIVIDER &&
                colorField(selected, "borderColor")}
            </div>

            {selected.type !== Type.DIVIDER && (
              <Form.Item label={t(`${KEY}.borderWidth`)}>
                <Slider
                  min={0}
                  max={CANVAS_LIMITS.border}
                  value={selected.borderWidth}
                  onChange={(borderWidth: number) =>
                    setElement(selected.key, { borderWidth })
                  }
                />
              </Form.Item>
            )}

            <Form.Item label={t(`${KEY}.radius`)}>
              <Slider
                min={0}
                max={200}
                value={Math.min(200, selected.radius)}
                onChange={(radius: number) =>
                  setElement(selected.key, { radius })
                }
              />
            </Form.Item>

            <Form.Item label={t(`${KEY}.opacity`)}>
              <Slider
                min={0}
                max={100}
                step={5}
                tooltip={{ formatter: (value?: number) => `${value ?? 0}%` }}
                value={selected.opacity}
                onChange={(opacity: number) =>
                  setElement(selected.key, { opacity })
                }
              />
            </Form.Item>
          </Form>
        </Card>
      )}
    </Space>
  );
};

export default CanvasFields;
