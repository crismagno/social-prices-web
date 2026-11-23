"use client";

import { Alert, Form, Input, Segmented, Select, Switch } from "antd";

import SiteChatIcon from "../../../components/store-site/shared/SiteChatIcon";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { IStoreSiteChat } from "../../../shared/business/store-sites/store-site-chat";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
}

/**
 * The chat of the site: whether visitors can write to the store, how the
 * button and the window look, and what is asked before the conversation.
 */
const ChatTab = ({ editor }: Props) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const { chat } = editor.draft;

  // From the draft as it is when applied, like every change of the editor.
  const set = (patch: Partial<IStoreSiteChat>): void =>
    editor.update((draft) => ({ chat: { ...draft.chat, ...patch } }));

  const modes = Object.values(StoreSitesEnum.ChatFieldMode).map(
    (mode: StoreSitesEnum.ChatFieldMode) => ({
      value: mode,
      label: t(`storeSite.editor.chat.modes.${mode}`),
    }),
  );

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
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 5 }}
              maxLength={300}
              placeholder={t("storeSite.chat.greeting")}
              value={chat.greeting ?? ""}
              onChange={(event) =>
                set({ greeting: event.target.value || null })
              }
            />
          </Form.Item>

          <div className="font-medium mb-1">
            {t("storeSite.editor.chat.asked")}
          </div>
          <p className="text-xs opacity-70 mb-3">
            {t("storeSite.editor.chat.askedHint")}
          </p>
          <Form.Item label={t("storeSite.chat.email")}>
            <Select
              value={chat.emailField}
              options={modes}
              onChange={(emailField: StoreSitesEnum.ChatFieldMode) =>
                set({ emailField })
              }
            />
          </Form.Item>
          <Form.Item label={t("storeSite.chat.phone")}>
            <Select
              value={chat.phoneField}
              options={modes}
              onChange={(phoneField: StoreSitesEnum.ChatFieldMode) =>
                set({ phoneField })
              }
            />
          </Form.Item>
        </>
      )}
    </Form>
  );
};

export default ChatTab;
