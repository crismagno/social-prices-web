"use client";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  HolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  ColorPicker,
  Form,
  Input,
  InputNumber,
  Segmented,
  Select,
  Space,
  Switch,
} from "antd";

import SiteChatIcon from "../../../components/store-site/shared/SiteChatIcon";
import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  chatFieldModeOf,
  ISiteChatExtraField,
  IStoreSiteChat,
  IStoreSiteChatColors,
  siteChatOf,
  SESSION_MINUTES_LIMITS,
} from "../../../shared/business/store-sites/store-site-chat";
import { IStoreSiteTheme } from "../../../shared/business/store-sites/store-site.interface";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import useDragReorder from "./useDragReorder";
import { IStoreSiteEditor } from "./useStoreSiteEditor";
import RichTextEditor from "../../../components/common/RichText/RichTextEditor";

/** The colours the chat can have of its own, and the site's each one falls back to. */
const CHAT_COLORS: {
  key: keyof IStoreSiteChatColors;
  siteKey: keyof IStoreSiteTheme;
}[] = [
  { key: "primary", siteKey: "primary" },
  { key: "background", siteKey: "background" },
  { key: "text", siteKey: "text" },
];

interface Props {
  editor: IStoreSiteEditor;
}

/**
 * The chat of the site: whether visitors can write to the store, how the
 * button and the window look, and what is asked before the conversation.
 */
const ChatTab = ({ editor }: Props) => {
  const { t } = useLanguageData();

  // The asked fields can be dragged into their order; the arrows stay for touch.
  const drag = useDragReorder((from: number, to: number) =>
    moveField(from, to),
  );

  if (!editor.draft) {
    return null;
  }

  const { chat } = editor.draft;

  // From the draft as it is when applied, like every change of the editor.
  // The customer fields asked, changed from the chat as it is when applied;
  // how the email and phone are asked follows the list.
  const setFields = (
    change: (fields: ISiteChatExtraField[]) => ISiteChatExtraField[],
  ): void =>
    editor.update((draft) => {
      const extraFields: ISiteChatExtraField[] = change(draft.chat.extraFields);

      return {
        chat: {
          ...draft.chat,
          extraFields,
          emailField: chatFieldModeOf(
            extraFields,
            StoreSitesEnum.ChatCustomerField.EMAIL,
          ),
          phoneField: chatFieldModeOf(
            extraFields,
            StoreSitesEnum.ChatCustomerField.PHONE,
          ),
        },
      };
    });

  // The customer fields not asked yet: what can still be added.
  const unasked: StoreSitesEnum.ChatCustomerField[] = Object.values(
    StoreSitesEnum.ChatCustomerField,
  ).filter(
    (field: StoreSitesEnum.ChatCustomerField) =>
      !(editor.draft?.chat.extraFields ?? []).some(
        (asked: ISiteChatExtraField) => asked.field === field,
      ),
  );

  const moveField = (from: number, to: number): void =>
    setFields((fields) => {
      const next: ISiteChatExtraField[] = [...fields];

      next.splice(to, 0, next.splice(from, 1)[0]);

      return next;
    });

  const set = (patch: Partial<IStoreSiteChat>): void =>
    editor.update((draft) => ({ chat: { ...draft.chat, ...patch } }));

  // One colour of the chat, from the draft as it is then; null is the site's.
  const setColor = (
    key: keyof IStoreSiteChatColors,
    color: string | null,
  ): void =>
    editor.update((draft) => ({
      chat: {
        ...draft.chat,
        colors: { ...siteChatOf(draft.chat).colors, [key]: color },
      },
    }));

  return (
    <Form layout="vertical">
      <Form.Item
        label={t("storeSite.editor.chat.show")}
        extra={t("storeSite.editor.chat.showHint")}
      >
        <Switch
          checked={chat.isActive}
          onChange={(isActive: boolean) => set({ isActive })}
        />
      </Form.Item>

      {chat.isActive && (
        <>
          <Alert
            className="mb-4"
            type="info"
            showIcon
            message={t("storeSite.editor.chat.where")}
          />

          <Form.Item label={t("storeSite.editor.chat.position")}>
            <Segmented<StoreSitesEnum.ChatPosition>
              value={chat.position}
              onChange={(position) => set({ position })}
              options={[
                {
                  value: StoreSitesEnum.ChatPosition.LEFT,
                  label: t("storeSite.editor.chat.positions.LEFT"),
                },
                {
                  value: StoreSitesEnum.ChatPosition.RIGHT,
                  label: t("storeSite.editor.chat.positions.RIGHT"),
                },
              ]}
            />
          </Form.Item>
          <Form.Item label={t("storeSite.editor.chat.icon")}>
            <Segmented<StoreSitesEnum.ChatIcon>
              value={chat.icon}
              onChange={(icon) => set({ icon })}
              options={Object.values(StoreSitesEnum.ChatIcon).map(
                (icon: StoreSitesEnum.ChatIcon) => ({
                  value: icon,
                  icon: <SiteChatIcon icon={icon} />,
                  title: t(`storeSite.editor.chat.icons.${icon}`),
                }),
              )}
            />
          </Form.Item>
          <Form.Item label={t("storeSite.editor.chat.buttonSize")}>
            <Segmented<StoreSitesEnum.ChatSize>
              value={chat.buttonSize}
              onChange={(buttonSize) => set({ buttonSize })}
              options={Object.values(StoreSitesEnum.ChatSize).map(
                (size: StoreSitesEnum.ChatSize) => ({
                  value: size,
                  label: t(`storeSite.editor.chat.sizes.${size}`),
                }),
              )}
            />
          </Form.Item>
          <Form.Item label={t("storeSite.editor.chat.windowSize")}>
            <Segmented<StoreSitesEnum.ChatSize>
              value={chat.windowSize}
              onChange={(windowSize) => set({ windowSize })}
              options={Object.values(StoreSitesEnum.ChatSize).map(
                (size: StoreSitesEnum.ChatSize) => ({
                  value: size,
                  label: t(`storeSite.editor.chat.sizes.${size}`),
                }),
              )}
            />
          </Form.Item>
          <Form.Item
            label={t("storeSite.editor.chat.buttonAnimation")}
            extra={t("storeSite.editor.chat.buttonAnimationHint")}
          >
            <Select<StoreSitesEnum.ChatButtonAnimation>
              value={chat.buttonAnimation}
              onChange={(buttonAnimation) => set({ buttonAnimation })}
              options={Object.values(StoreSitesEnum.ChatButtonAnimation).map(
                (animation: StoreSitesEnum.ChatButtonAnimation) => ({
                  value: animation,
                  label: t(
                    `storeSite.editor.chat.buttonAnimations.${animation}`,
                  ),
                }),
              )}
            />
          </Form.Item>
          <Form.Item
            label={t("storeSite.editor.chat.windowAnimation")}
            extra={t("storeSite.editor.chat.windowAnimationHint")}
          >
            <Select<StoreSitesEnum.ChatWindowAnimation>
              value={chat.windowAnimation}
              onChange={(windowAnimation) => set({ windowAnimation })}
              options={Object.values(StoreSitesEnum.ChatWindowAnimation).map(
                (animation: StoreSitesEnum.ChatWindowAnimation) => ({
                  value: animation,
                  label: t(
                    `storeSite.editor.chat.windowAnimations.${animation}`,
                  ),
                }),
              )}
            />
          </Form.Item>
          <Form.Item
            label={t("storeSite.editor.chat.buttonLabel")}
            extra={t("storeSite.editor.chat.buttonLabelHint")}
          >
            <Input
              maxLength={30}
              allowClear
              placeholder={t("storeSite.chat.button")}
              value={chat.buttonLabel ?? ""}
              onChange={(event) =>
                set({ buttonLabel: event.target.value || null })
              }
            />
          </Form.Item>
          <Form.Item
            label={t("storeSite.editor.chat.title")}
            extra={t("storeSite.editor.chat.titleHint")}
          >
            <Input
              maxLength={60}
              allowClear
              value={chat.title ?? ""}
              onChange={(event) => set({ title: event.target.value || null })}
            />
          </Form.Item>
          <Form.Item label={t("storeSite.editor.chat.greeting")}>
            <RichTextEditor
              variant="chat"
              maxLength={300}
              placeholder={t("storeSite.chat.greeting")}
              value={chat.greeting ?? ""}
              onChange={(greeting: string) =>
                set({ greeting: greeting || null })
              }
            />
          </Form.Item>

          <div className="font-medium mb-1">
            {t("storeSite.editor.chat.asked")}
          </div>
          <p className="text-xs opacity-70 mb-3">
            {t("storeSite.editor.chat.askedHint")}
          </p>
          <Form.Item
            label={t("storeSite.editor.chat.extra.title")}
            extra={t("storeSite.editor.chat.extra.hint")}
          >
            <Space direction="vertical" className="w-full" size={8}>
              {chat.extraFields.map(
                (asked: ISiteChatExtraField, index: number) => (
                  <div
                    key={asked.field}
                    className="flex items-center gap-2 rounded"
                    {...drag.itemProps(index)}
                  >
                    <HolderOutlined
                      className="opacity-50 shrink-0"
                      aria-hidden
                    />
                    <Space.Compact className="w-full">
                      <Select<StoreSitesEnum.ChatCustomerField>
                        className="w-full"
                        value={asked.field}
                        onChange={(field) =>
                          setFields((fields) =>
                            fields.map((each) =>
                              each.field === asked.field
                                ? { ...each, field }
                                : each,
                            ),
                          )
                        }
                        // A field already asked cannot be picked twice.
                        options={Object.values(
                          StoreSitesEnum.ChatCustomerField,
                        ).map((field: StoreSitesEnum.ChatCustomerField) => ({
                          value: field,
                          label: t(`storeSite.chat.fields.${field}`),
                          disabled:
                            field !== asked.field &&
                            chat.extraFields.some(
                              (each) => each.field === field,
                            ),
                        }))}
                      />
                      <Select<string>
                        style={{ width: 140 }}
                        value={asked.isRequired ? "REQUIRED" : "OPTIONAL"}
                        onChange={(value) =>
                          setFields((fields) =>
                            fields.map((each) =>
                              each.field === asked.field
                                ? { ...each, isRequired: value === "REQUIRED" }
                                : each,
                            ),
                          )
                        }
                        options={[
                          {
                            value: "REQUIRED",
                            label: t("storeSite.editor.chat.modes.REQUIRED"),
                          },
                          {
                            value: "OPTIONAL",
                            label: t("storeSite.editor.chat.modes.OPTIONAL"),
                          },
                        ]}
                      />
                      <Button
                        icon={<ArrowUpOutlined />}
                        disabled={index === 0}
                        aria-label={t("storeSite.editor.moveUp")}
                        onClick={() => moveField(index, index - 1)}
                      />
                      <Button
                        icon={<ArrowDownOutlined />}
                        disabled={index === chat.extraFields.length - 1}
                        aria-label={t("storeSite.editor.moveDown")}
                        onClick={() => moveField(index, index + 1)}
                      />
                      <Button
                        danger
                        type="primary"
                        icon={<DeleteOutlined />}
                        aria-label={t("storeSite.editor.remove")}
                        onClick={() =>
                          setFields((fields) =>
                            fields.filter((each) => each.field !== asked.field),
                          )
                        }
                      />
                    </Space.Compact>
                  </div>
                ),
              )}
              {unasked.length > 0 && (
                <Select<StoreSitesEnum.ChatCustomerField>
                  className="w-full"
                  value={null}
                  placeholder={
                    <span>
                      <PlusOutlined /> {t("storeSite.editor.chat.extra.add")}
                    </span>
                  }
                  onChange={(field) =>
                    setFields((fields) => [
                      ...fields,
                      { field, isRequired: false },
                    ])
                  }
                  options={unasked.map(
                    (field: StoreSitesEnum.ChatCustomerField) => ({
                      value: field,
                      label: t(`storeSite.chat.fields.${field}`),
                    }),
                  )}
                />
              )}
            </Space>
          </Form.Item>

          <Form.Item
            label={t("storeSite.editor.chat.colors.label")}
            extra={t("storeSite.editor.chat.colors.hint")}
          >
            <div className="flex flex-wrap gap-4">
              {CHAT_COLORS.map(({ key, siteKey }) => (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-xs opacity-70">
                    {t(`storeSite.editor.chat.colors.${key}`)}
                  </span>
                  <ColorPicker
                    allowClear
                    disabledAlpha
                    value={chat.colors[key] ?? editor.draft?.theme[siteKey]}
                    showText={() =>
                      chat.colors[key] ??
                      t("storeSite.editor.pages.colorOfSite")
                    }
                    onChangeComplete={(color) =>
                      setColor(key, color.toHexString().slice(0, 7))
                    }
                    onClear={() => setColor(key, null)}
                  />
                </div>
              ))}
            </div>
          </Form.Item>

          <Form.Item
            label={t("storeSite.editor.chat.sessionMinutes")}
            extra={t("storeSite.editor.chat.sessionMinutesHint")}
          >
            <InputNumber
              min={SESSION_MINUTES_LIMITS.min}
              max={SESSION_MINUTES_LIMITS.max}
              step={5}
              precision={0}
              value={chat.sessionMinutes}
              addonAfter={t("storeSite.editor.chat.minutes")}
              onChange={(value: number | null) =>
                set({
                  sessionMinutes: value ?? SESSION_MINUTES_LIMITS.initial,
                })
              }
            />
          </Form.Item>
        </>
      )}
    </Form>
  );
};

export default ChatTab;
