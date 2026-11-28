"use client";

import {
  Button,
  Card,
  ColorPicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Segmented,
  Select,
  Slider,
  Switch,
} from "antd";

import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  HolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import FeatureIcon from "../../../components/store-site/shared/blocks/FeatureIcon";
import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreSiteHeaderBorder,
  HEADER_HEIGHT_RANGE,
  HEADER_SLOT_ALIGNS,
  HEADER_WIDTH_RANGE,
  headerButtonIndex,
  headerButtonToken,
  siteHeaderOf,
} from "../../../shared/business/store-sites/store-site-header";
import { IStoreSiteSignIn } from "../../../shared/business/store-sites/store-site-sign-in";
import { IStoreSiteLogo } from "../../../shared/business/store-sites/store-site.interface";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import {
  IStoreSiteBlockButton,
  newBlockButton,
} from "../../../shared/business/store-sites/store-site-blocks";
import { sitePagesOf } from "../../../shared/business/store-sites/store-site-pages";
import ButtonFields from "./ButtonFields";
import ChoiceList from "./ChoiceList";
import HomeMenuFields from "./HomeMenuFields";
import MenuOrderFields from "./MenuOrderFields";
import ImageField from "./ImageField";
import SizeFields from "./SizeFields";
import useDragReorder from "./useDragReorder";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

/** The choice of the border select that leaves the usual thin line. */
const USUAL_BORDER: string = "USUAL";

interface Props {
  editor: IStoreSiteEditor;
  storeId: string;
  /** The store's own name: what the header shows when left empty. */
  storeName: string;
}

/**
 * The header of the site: where it is on the screen, the name and the logo,
 * and the sign-in button. It is the site's own, the same on every page; the
 * entrance of each page is another matter.
 */
const HeaderTab = ({ editor, storeId, storeName }: Props) => {
  const { t } = useLanguageData();

  // A part of the header dragged onto another takes its place; the ones
  // between move along. From the draft as it is then.
  const moveTo = (from: number, to: number): void =>
    editor.update((draft) => {
      const order: StoreSitesEnum.HeaderPart[] = [
        ...siteHeaderOf(draft.header).order,
      ];

      order.splice(to, 0, order.splice(from, 1)[0]);

      return { header: { ...draft.header, order } };
    });

  const drag = useDragReorder(moveTo);

  // The buttons of the header change places the same way.
  const moveAction = (from: number, to: number): void =>
    editor.update((draft) => {
      const actionsOrder: string[] = [
        ...siteHeaderOf(draft.header).actionsOrder,
      ];

      actionsOrder.splice(to, 0, actionsOrder.splice(from, 1)[0]);

      return { header: { ...draft.header, actionsOrder } };
    });

  const actionsDrag = useDragReorder(moveAction);

  if (!editor.draft) {
    return null;
  }

  const { logo, header } = editor.draft;

  const signIn: IStoreSiteSignIn = editor.draft.signIn;

  const isSide: boolean =
    header.position === StoreSitesEnum.HeaderPosition.LEFT ||
    header.position === StoreSitesEnum.HeaderPosition.RIGHT;

  // A change to the border the owner already chose.
  const setBorder = (patch: Partial<IStoreSiteHeaderBorder>): void =>
    editor.update((draft) => ({
      header: {
        ...draft.header,
        border: draft.header.border
          ? { ...draft.header.border, ...patch }
          : null,
      },
    }));

  // From the draft as it is when applied, like every change of the editor.
  const setSignIn = (patch: Partial<IStoreSiteSignIn>): void =>
    editor.update((draft) => ({ signIn: { ...draft.signIn, ...patch } }));

  // The owner's own buttons, from the draft as it is then.
  const setButtons = (
    change: (buttons: IStoreSiteBlockButton[]) => IStoreSiteBlockButton[],
  ): void =>
    editor.update((draft) => ({
      header: {
        ...draft.header,
        buttons: change(siteHeaderOf(draft.header).buttons),
      },
    }));

  // A button removed leaves the order too; those after it move up one place.
  const removeButton = (index: number): void =>
    editor.update((draft) => {
      const current = siteHeaderOf(draft.header);

      return {
        header: {
          ...draft.header,
          buttons: current.buttons.filter((_, at: number) => at !== index),
          actionsOrder: current.actionsOrder
            .filter((token: string) => headerButtonIndex(token) !== index)
            .map((token: string) =>
              headerButtonIndex(token) > index
                ? headerButtonToken(headerButtonIndex(token) - 1)
                : token,
            ),
        },
      };
    });

  // What a place in the order is called: the button's own words, when it has some.
  const actionName = (token: string): string => {
    const at: number = headerButtonIndex(token);

    return at < 0
      ? t(`storeSite.editor.header.actions.${token}`)
      : header.buttons[at]?.label?.trim() ||
          `${t("storeSite.editor.builder.fields.button")} ${at + 1}`;
  };

  const setLogo = (patch: Partial<IStoreSiteLogo>): void =>
    editor.update((draft) => ({ logo: { ...draft.logo, ...patch } }));

  return (
    <Form layout="vertical">
      <Form.Item label={t("storeSite.editor.header.position")}>
        <ChoiceList<StoreSitesEnum.HeaderPosition>
          value={header.position}
          onChange={(position: StoreSitesEnum.HeaderPosition) =>
            editor.update((draft) => ({
              header: { ...draft.header, position },
            }))
          }
          options={Object.values(StoreSitesEnum.HeaderPosition).map(
            (position: StoreSitesEnum.HeaderPosition) => ({
              value: position,
              label: t(`storeSite.editor.header.positions.${position}.label`),
              hint: t(`storeSite.editor.header.positions.${position}.hint`),
            }),
          )}
        />
      </Form.Item>

      <Form.Item
        label={t("storeSite.editor.header.order")}
        extra={t("storeSite.editor.header.orderHint")}
      >
        <div className="flex flex-col gap-2">
          {header.order.map((part: StoreSitesEnum.HeaderPart, slot: number) => (
            <div
              key={part}
              className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5"
              {...drag.itemProps(slot)}
            >
              <HolderOutlined className="opacity-50" />
              <span className="w-16 shrink-0 text-xs opacity-60">
                {t(`storeSite.editor.header.slots.${slot}`)}
              </span>
              <span className="flex-1 font-medium">
                {t(`storeSite.editor.header.parts.${part}`)}
              </span>
              <Segmented<StoreSitesEnum.HeaderAlign>
                size="small"
                value={header.aligns[part] ?? HEADER_SLOT_ALIGNS[slot]}
                onChange={(align: StoreSitesEnum.HeaderAlign) =>
                  editor.update((draft) => ({
                    header: {
                      ...draft.header,
                      aligns: {
                        ...siteHeaderOf(draft.header).aligns,
                        [part]: align,
                      },
                    },
                  }))
                }
                options={[
                  {
                    value: StoreSitesEnum.HeaderAlign.LEFT,
                    icon: <AlignLeftOutlined />,
                    title: t("storeSite.editor.header.aligns.LEFT"),
                  },
                  {
                    value: StoreSitesEnum.HeaderAlign.CENTER,
                    icon: <AlignCenterOutlined />,
                    title: t("storeSite.editor.header.aligns.CENTER"),
                  },
                  {
                    value: StoreSitesEnum.HeaderAlign.RIGHT,
                    icon: <AlignRightOutlined />,
                    title: t("storeSite.editor.header.aligns.RIGHT"),
                  },
                ]}
              />
              <Button
                type="text"
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={slot === 0}
                aria-label={t("storeSite.editor.moveUp")}
                onClick={() => moveTo(slot, slot - 1)}
              />
              <Button
                type="text"
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={slot === header.order.length - 1}
                aria-label={t("storeSite.editor.moveDown")}
                onClick={() => moveTo(slot, slot + 1)}
              />
            </div>
          ))}
        </div>
      </Form.Item>

      {/* The home and the pages of the menu, in the order they are shown. */}
      <MenuOrderFields editor={editor} />

      <Form.Item
        label={t("storeSite.editor.header.clean")}
        extra={t("storeSite.editor.header.cleanHint")}
      >
        <Slider
          min={0}
          max={100}
          step={5}
          marks={{ 0: "0%", 50: "50%", 100: "100%" }}
          tooltip={{ formatter: (value?: number) => `${value ?? 0}%` }}
          value={header.transparency}
          onChange={(transparency: number) =>
            editor.update((draft) => ({
              header: { ...draft.header, transparency },
            }))
          }
        />
      </Form.Item>

      <Form.Item
        label={t("storeSite.editor.header.shadow")}
        extra={t("storeSite.editor.header.shadowHint")}
      >
        <Slider
          min={0}
          max={100}
          step={5}
          marks={{ 0: "0%", 50: "50%", 100: "100%" }}
          tooltip={{ formatter: (value?: number) => `${value ?? 0}%` }}
          // Until one is chosen: the usual light shadow, none where there is none.
          value={
            header.shadow ??
            (header.transparency > 0 || isSide
              ? 0
              : StoreSitesEnum.DEFAULT_HEADER_SHADOW)
          }
          onChange={(shadow: number) =>
            editor.update((draft) => ({
              header: { ...draft.header, shadow },
            }))
          }
        />
      </Form.Item>

      {/* Its border: the usual thin line, none, or the owner's own. */}
      <Form.Item
        label={t("storeSite.editor.header.border.label")}
        extra={t("storeSite.editor.header.border.hint")}
      >
        <Select
          value={header.border?.style ?? USUAL_BORDER}
          options={[
            {
              value: USUAL_BORDER,
              label: t("storeSite.editor.header.border.styles.USUAL"),
            },
            ...Object.values(StoreSitesEnum.BorderStyle).map(
              (style: StoreSitesEnum.BorderStyle) => ({
                value: style as string,
                label: t(`storeSite.editor.header.border.styles.${style}`),
              }),
            ),
          ]}
          onChange={(style: string) =>
            editor.update((draft) => ({
              header: {
                ...draft.header,
                border:
                  style === USUAL_BORDER
                    ? null
                    : {
                        width: draft.header.border?.width ?? 2,
                        color: draft.header.border?.color ?? null,
                        style: style as StoreSitesEnum.BorderStyle,
                      },
              },
            }))
          }
        />
      </Form.Item>
      {header.border &&
        header.border.style !== StoreSitesEnum.BorderStyle.NONE && (
          <div className="flex flex-wrap gap-x-6">
            <Form.Item label={t("storeSite.editor.header.border.width")}>
              <InputNumber
                min={StoreSitesEnum.HEADER_BORDER_WIDTH_RANGE[0]}
                max={StoreSitesEnum.HEADER_BORDER_WIDTH_RANGE[1]}
                addonAfter="px"
                value={header.border.width}
                onChange={(width: number | null) =>
                  setBorder({ width: width ?? 1 })
                }
              />
            </Form.Item>
            <Form.Item label={t("storeSite.editor.header.border.color")}>
              <ColorPicker
                allowClear
                disabledAlpha
                value={header.border.color ?? editor.draft.theme.text}
                showText={() =>
                  header.border?.color ??
                  t("storeSite.editor.pages.colorOfSite")
                }
                onChangeComplete={(picked) =>
                  setBorder({ color: picked.toHexString().slice(0, 7) })
                }
                onClear={() => setBorder({ color: null })}
              />
            </Form.Item>
          </div>
        )}

      {/* Its size: how tall across the screen, how wide down a side. */}
      {isSide ? (
        <Form.Item
          label={t("storeSite.editor.header.width")}
          extra={t("storeSite.editor.header.sizeHint")}
        >
          <InputNumber
            className="w-full"
            min={HEADER_WIDTH_RANGE[0]}
            max={HEADER_WIDTH_RANGE[1]}
            precision={0}
            addonAfter="px"
            placeholder="240"
            value={header.width}
            onChange={(width: number | null) =>
              editor.update((draft) => ({
                header: { ...draft.header, width },
              }))
            }
          />
        </Form.Item>
      ) : (
        <Form.Item
          label={t("storeSite.editor.header.height")}
          extra={t("storeSite.editor.header.sizeHint")}
        >
          <InputNumber
            className="w-full"
            min={HEADER_HEIGHT_RANGE[0]}
            max={HEADER_HEIGHT_RANGE[1]}
            precision={0}
            addonAfter="px"
            placeholder={t("storeSite.editor.sizes.auto")}
            value={header.height}
            onChange={(height: number | null) =>
              editor.update((draft) => ({
                header: { ...draft.header, height },
              }))
            }
          />
        </Form.Item>
      )}

      {/* With a background of its own, its colour can be chosen. */}
      {header.transparency < 100 && (
        <Form.Item
          label={t("storeSite.editor.header.background")}
          extra={t("storeSite.editor.header.backgroundHint")}
        >
          <ColorPicker
            allowClear
            disabledAlpha
            value={header.background ?? editor.draft.theme.background}
            showText={() =>
              header.background ?? t("storeSite.editor.pages.colorOfSite")
            }
            onChangeComplete={(picked) =>
              editor.update((draft) => ({
                header: {
                  ...draft.header,
                  background: picked.toHexString().slice(0, 7),
                },
              }))
            }
            onClear={() =>
              editor.update((draft) => ({
                header: { ...draft.header, background: null },
              }))
            }
          />
        </Form.Item>
      )}

      <Form.Item
        label={t("storeSite.editor.header.color")}
        extra={t("storeSite.editor.header.colorHint")}
      >
        <ColorPicker
          allowClear
          disabledAlpha
          value={header.color ?? editor.draft.theme.text}
          showText={() =>
            header.color ?? t("storeSite.editor.pages.colorOfSite")
          }
          onChangeComplete={(color) =>
            editor.update((draft) => ({
              header: {
                ...draft.header,
                color: color.toHexString().slice(0, 7),
              },
            }))
          }
          onClear={() =>
            editor.update((draft) => ({
              header: { ...draft.header, color: null },
            }))
          }
        />
      </Form.Item>

      {/* Anywhere but the top it is always on screen. */}
      {header.position === StoreSitesEnum.HeaderPosition.TOP && (
        <Form.Item
          label={t("storeSite.editor.hero.fixedHeader")}
          extra={t("storeSite.editor.hero.fixedHeaderHint")}
        >
          <Switch
            checked={editor.draft.header.isFixed}
            onChange={(isFixed: boolean) =>
              editor.update((draft) => ({
                header: { ...draft.header, isFixed },
              }))
            }
          />
        </Form.Item>
      )}

      <Form.Item
        label={t("storeSite.editor.displayName.label")}
        extra={t("storeSite.editor.displayName.hint")}
      >
        <Input
          maxLength={60}
          allowClear
          // Never set, it is the store's name; emptied, the header shows none.
          value={editor.draft.displayName ?? storeName}
          onChange={(event) =>
            editor.update({ displayName: event.target.value })
          }
        />
      </Form.Item>
      <SizeFields
        editor={editor}
        sizes={["brandNameWidth", "brandNameHeight", "brandNameSize"]}
      />
      <Form.Item label={t("storeSite.editor.logo.show")}>
        <Switch
          checked={logo.isActive}
          onChange={(isActive: boolean) => setLogo({ isActive })}
        />
      </Form.Item>
      {logo.isActive && (
        <Form.Item
          label={t("storeSite.editor.logo.image")}
          extra={t("storeSite.editor.logo.imageHint")}
        >
          <ImageField
            storeId={storeId}
            value={logo.imageUrl}
            onChange={(imageUrl) => setLogo({ imageUrl })}
          />
        </Form.Item>
      )}
      {logo.isActive && (
        <SizeFields editor={editor} sizes={["logoWidth", "logoHeight"]} />
      )}

      {/* The "home" of the menu: the same choice the pages tab shows. */}
      <div className="mb-5">
        <HomeMenuFields editor={editor} />
      </div>

      <Divider orientation="left" plain>
        {t("storeSite.editor.header.buttons")}
      </Divider>
      <p className="text-xs opacity-70 mb-3">
        {t("storeSite.editor.header.buttonsHint")}
      </p>
      <Form.Item
        label={t("storeSite.editor.header.actionsOrder")}
        extra={t("storeSite.editor.header.actionsOrderHint")}
      >
        <div className="flex flex-col gap-2">
          {header.actionsOrder.map((action: string, at: number) => (
            <div
              key={action}
              className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5"
              {...actionsDrag.itemProps(at)}
            >
              <HolderOutlined className="opacity-50" />
              <span className="flex-1 font-medium truncate">
                {actionName(action)}
              </span>
              <Button
                type="text"
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={at === 0}
                aria-label={t("storeSite.editor.moveUp")}
                onClick={() => moveAction(at, at - 1)}
              />
              <Button
                type="text"
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={at === header.actionsOrder.length - 1}
                aria-label={t("storeSite.editor.moveDown")}
                onClick={() => moveAction(at, at + 1)}
              />
            </div>
          ))}
        </div>
      </Form.Item>

      <Form.Item
        label={t("storeSite.editor.header.buttonSize")}
        extra={t("storeSite.editor.header.buttonSizeHint")}
      >
        <Segmented<StoreSitesEnum.CartButtonSize>
          value={header.buttonSize}
          onChange={(buttonSize: StoreSitesEnum.CartButtonSize) =>
            editor.update((draft) => ({
              header: { ...draft.header, buttonSize },
            }))
          }
          options={Object.values(StoreSitesEnum.CartButtonSize).map(
            (size: StoreSitesEnum.CartButtonSize) => ({
              value: size,
              label: t(`storeSite.editor.hero.cart.sizes.${size}`),
            }),
          )}
        />
      </Form.Item>

      <div className="flex flex-col gap-2 mb-5">
        {header.buttons.map((button: IStoreSiteBlockButton, index: number) => (
          <Card
            key={index}
            size="small"
            title={`${t("storeSite.editor.builder.fields.button")} ${index + 1}`}
            extra={
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                aria-label={t("storeSite.editor.remove")}
                onClick={() => removeButton(index)}
              />
            }
          >
            <ButtonFields
              button={button}
              pages={sitePagesOf(editor.draft?.pages)}
              withVariant
              withIcon
              onChange={(patch) =>
                setButtons((list) =>
                  list.map((each, at) =>
                    at === index ? newBlockButton({ ...each, ...patch }) : each,
                  ),
                )
              }
            />
          </Card>
        ))}
        <Button
          icon={<PlusOutlined />}
          disabled={header.buttons.length >= StoreSitesEnum.MAX_HEADER_BUTTONS}
          onClick={() =>
            setButtons((list) => [
              ...list,
              newBlockButton({
                label: t("storeSite.editor.header.newButton"),
                variant: StoreSitesEnum.ButtonVariant.OUTLINE,
              }),
            ])
          }
        >
          {t("storeSite.editor.header.addButton")} ({header.buttons.length}/
          {StoreSitesEnum.MAX_HEADER_BUTTONS})
        </Button>
      </div>

      <Divider orientation="left" plain>
        {t("storeSite.editor.signIn.heading")}
      </Divider>
      <p className="text-xs opacity-70 mb-3">
        {t("storeSite.editor.signIn.hint")}
      </p>
      <Form.Item label={t("storeSite.editor.signIn.show")}>
        <Switch
          checked={signIn.isVisible}
          onChange={(isVisible: boolean) => setSignIn({ isVisible })}
        />
      </Form.Item>
      <Form.Item
        label={t("storeSite.editor.signIn.label")}
        extra={t("storeSite.editor.signIn.labelHint")}
      >
        <Input
          maxLength={30}
          allowClear
          placeholder={t("storeSite.signIn.default")}
          value={signIn.label ?? ""}
          onChange={(event) => setSignIn({ label: event.target.value || null })}
        />
      </Form.Item>
      <Form.Item label={t("storeSite.editor.signIn.destination")}>
        <Select
          value={signIn.destination}
          onChange={(destination: StoreSitesEnum.SignInDestination) =>
            setSignIn({ destination })
          }
          options={Object.values(StoreSitesEnum.SignInDestination).map(
            (destination: StoreSitesEnum.SignInDestination) => ({
              value: destination,
              label: t(`storeSite.editor.signIn.destinations.${destination}`),
            }),
          )}
        />
      </Form.Item>
    </Form>
  );
};

export default HeaderTab;
