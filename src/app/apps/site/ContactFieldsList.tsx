"use client";

import { useState } from "react";

import {
  Button,
  Collapse,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Tag,
} from "antd";

import {
  DeleteOutlined,
  PlusOutlined,
  ShrinkOutlined,
  ArrowsAltOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  CONTACT_LIMITS,
  IStoreSiteContactField,
  IStoreSiteContactForm,
  newContactField,
} from "../../../shared/business/store-sites/store-site-contact";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";

interface Props {
  fields: IStoreSiteContactField[];
  /** Applied to the form as it is then. */
  onChange: (
    change: (current: IStoreSiteContactForm) => Partial<IStoreSiteContactForm>,
  ) => void;
}

const KEY = "storeSite.editor.contactForm";

const Type = StoreSitesEnum.ContactFieldType;

/**
 * What the form asks: each field folds to one line (its name, kind and
 * whether it must be filled) and opens to be changed. Its place in the form is
 * chosen from a list on that line.
 */
const ContactFieldsList = ({ fields, onChange }: Props) => {
  const { t } = useLanguageData();

  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const setField = (
    key: string,
    patch: Partial<IStoreSiteContactField>,
  ): void =>
    onChange((current) => ({
      fields: current.fields.map((asked: IStoreSiteContactField) =>
        asked.key === key ? { ...asked, ...patch } : asked,
      ),
    }));

  const moveTo = (key: string, to: number): void =>
    onChange((current) => {
      const next: IStoreSiteContactField[] = [...current.fields];
      const from: number = next.findIndex(
        (asked: IStoreSiteContactField) => asked.key === key,
      );

      if (from < 0 || from === to) {
        return {};
      }

      next.splice(to, 0, next.splice(from, 1)[0]);

      return { fields: next };
    });

  const remove = (key: string): void => {
    onChange((current) => ({
      fields: current.fields.filter(
        (asked: IStoreSiteContactField) => asked.key !== key,
      ),
    }));
    setOpenKeys((current: string[]) => current.filter((each) => each !== key));
  };

  const add = (): void => {
    const added: IStoreSiteContactField = newContactField();

    onChange((current) => ({ fields: [...current.fields, added] }));
    // The new field opens, ready to be named.
    setOpenKeys((current: string[]) => [...current, added.key]);
  };

  const isFull: boolean = fields.length >= StoreSitesEnum.MAX_CONTACT_FIELDS;
  const isAllOpen: boolean =
    fields.length > 0 && openKeys.length === fields.length;

  const positionOptions = fields.map((_, index: number) => ({
    value: index,
    label: t(`${KEY}.positionOption`).replace("{n}", String(index + 1)),
  }));

  return (
    <Space direction="vertical" className="w-full">
      <div className="flex justify-end">
        <Button
          size="small"
          type="link"
          icon={isAllOpen ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
          onClick={() =>
            setOpenKeys(
              isAllOpen
                ? []
                : fields.map((asked: IStoreSiteContactField) => asked.key),
            )
          }
        >
          {t(isAllOpen ? `${KEY}.collapseAll` : `${KEY}.expandAll`)}
        </Button>
      </div>

      <Collapse
        size="small"
        activeKey={openKeys}
        onChange={(keys) => setOpenKeys(Array.isArray(keys) ? keys : [keys])}
        items={fields.map((asked: IStoreSiteContactField, index: number) => ({
          key: asked.key,
          label: (
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate font-medium">
                {asked.label?.trim() || t(`${KEY}.types.${asked.type}`)}
              </span>
              {asked.label?.trim() && (
                <Tag bordered={false} className="m-0 shrink-0">
                  {t(`${KEY}.types.${asked.type}`)}
                </Tag>
              )}
              {asked.isRequired && (
                <Tag bordered={false} color="red" className="m-0 shrink-0">
                  {t(`${KEY}.requiredShort`)}
                </Tag>
              )}
            </span>
          ),
          extra: (
            // Clicks here change the field, they do not fold it.
            <span
              className="flex items-center gap-1"
              onClick={(event) => event.stopPropagation()}
            >
              <Select<number>
                size="small"
                className="w-24"
                aria-label={t(`${KEY}.position`)}
                title={t(`${KEY}.position`)}
                value={index}
                options={positionOptions}
                popupMatchSelectWidth={false}
                onChange={(to: number) => moveTo(asked.key, to)}
              />
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                // A form asks at least one thing.
                disabled={fields.length === 1}
                aria-label={t("storeSite.editor.remove")}
                onClick={() => remove(asked.key)}
              />
            </span>
          ),
          children: (
            <>
              <Form.Item label={t(`${KEY}.type`)}>
                <Select<StoreSitesEnum.ContactFieldType>
                  value={asked.type}
                  onChange={(type) => setField(asked.key, { type })}
                  options={Object.values(Type).map(
                    (type: StoreSitesEnum.ContactFieldType) => ({
                      value: type,
                      label: t(`${KEY}.types.${type}`),
                    }),
                  )}
                />
              </Form.Item>
              <Form.Item label={t(`${KEY}.label`)}>
                <Input
                  allowClear
                  maxLength={CONTACT_LIMITS.label}
                  placeholder={t(`${KEY}.types.${asked.type}`)}
                  value={asked.label ?? ""}
                  onChange={(event) =>
                    setField(asked.key, { label: event.target.value || null })
                  }
                />
              </Form.Item>
              <Form.Item label={t(`${KEY}.placeholder`)}>
                <Input
                  allowClear
                  maxLength={CONTACT_LIMITS.placeholder}
                  value={asked.placeholder ?? ""}
                  onChange={(event) =>
                    setField(asked.key, {
                      placeholder: event.target.value || null,
                    })
                  }
                />
              </Form.Item>
              {asked.type === Type.SELECT && (
                <Form.Item
                  label={t(`${KEY}.options`)}
                  extra={t(`${KEY}.optionsHint`)}
                >
                  <Input.TextArea
                    autoSize={{ minRows: 2, maxRows: 8 }}
                    value={asked.options.join("\n")}
                    onChange={(event) =>
                      setField(asked.key, {
                        // Kept as typed, blank lines too, so a new line can be
                        // started: the API keeps the ones with words.
                        options: event.target.value
                          .split("\n")
                          .slice(0, StoreSitesEnum.MAX_CONTACT_OPTIONS)
                          .map((option: string) =>
                            option.slice(0, CONTACT_LIMITS.option),
                          ),
                      })
                    }
                  />
                </Form.Item>
              )}
              <label className="flex items-center justify-between gap-3">
                <span>{t(`${KEY}.required`)}</span>
                <Switch
                  checked={asked.isRequired}
                  onChange={(isRequired: boolean) =>
                    setField(asked.key, { isRequired })
                  }
                />
              </label>
            </>
          ),
        }))}
      />

      <Button
        block
        type="dashed"
        icon={<PlusOutlined />}
        disabled={isFull}
        onClick={add}
      >
        {t(`${KEY}.addField`)} ({fields.length}/
        {StoreSitesEnum.MAX_CONTACT_FIELDS})
      </Button>
    </Space>
  );
};

export default ContactFieldsList;
