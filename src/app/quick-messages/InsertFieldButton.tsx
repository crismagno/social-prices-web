"use client";

import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";

import { FieldStringOutlined } from "@ant-design/icons";

import useLanguageData from "../../data/context/language/useLanguageData";
import { IQuickMessageFieldInfo } from "../../shared/business/quick-messages/quick-messages.types";

interface Props {
  fields: IQuickMessageFieldInfo[];
  onInsert: (token: string) => void;
  disabled?: boolean;
}

// Lists the fields a text may use, grouped by who they come from; picking one
// hands back `{key}` to be put where the cursor is.
export default function InsertFieldButton({
  fields,
  onInsert,
  disabled,
}: Props) {
  const { t } = useLanguageData();

  const group = (name: IQuickMessageFieldInfo["group"]) => ({
    type: "group" as const,
    key: name,
    label: t(`quickMessages.fieldGroups.${name}`),
    children: fields
      .filter((field: IQuickMessageFieldInfo) => field.group === name)
      .map((field: IQuickMessageFieldInfo) => ({
        key: field.key,
        label: (
          <span className="flex justify-between gap-4">
            <span>{t(field.labelKey)}</span>
            <code className="opacity-60">{`{${field.key}}`}</code>
          </span>
        ),
      })),
  });

  const items: MenuProps["items"] = [group("cliente"), group("funcionario")];

  return (
    <Dropdown
      menu={{
        items,
        onClick: ({ key }) => onInsert(`{${key}}`),
        style: { maxHeight: 320, overflowY: "auto" },
      }}
      trigger={["click"]}
      disabled={disabled || !fields.length}
    >
      <Button size="small" icon={<FieldStringOutlined />}>
        {t("quickMessages.insertField")}
      </Button>
    </Dropdown>
  );
}
