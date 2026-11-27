"use client";

import { Alert, Button, Card, Form, Input, Select, Space, Switch } from "antd";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
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
  contact: IStoreSiteContactForm;
  /** Applied to the form as it is then. */
  onChange: (
    change: (current: IStoreSiteContactForm) => Partial<IStoreSiteContactForm>,
  ) => void;
}

const KEY = "storeSite.editor.contactForm";

const Type = StoreSitesEnum.ContactFieldType;
const Destination = StoreSitesEnum.ContactDestination;

/**
 * The form of the contact page: its words, what it asks (each field with its
 * kind, its name and whether it must be filled, in the order shown) and where
 * what a visitor writes goes.
 */
const ContactFormFields = ({ contact, onChange }: Props) => {
  const { t } = useLanguageData();

  const set = (patch: Partial<IStoreSiteContactForm>): void =>
    onChange(() => patch);

  const setField = (
    key: string,
    patch: Partial<IStoreSiteContactField>,
  ): void =>
    onChange((current) => ({
      fields: current.fields.map((asked: IStoreSiteContactField) =>
        asked.key === key ? { ...asked, ...patch } : asked,
      ),
    }));

  const move = (from: number, to: number): void =>
    onChange((current) => {
      const fields: IStoreSiteContactField[] = [...current.fields];

      fields.splice(to, 0, fields.splice(from, 1)[0]);

      return { fields };
    });

  const isFull: boolean =
    contact.fields.length >= StoreSitesEnum.MAX_CONTACT_FIELDS;

  // The address the chosen destination needs, when it has none yet.
  const isMissingAddress: boolean =
    (contact.destination === Destination.EMAIL && !contact.email?.trim()) ||
    (contact.destination === Destination.WHATSAPP &&
      !contact.whatsapp?.trim()) ||
    (contact.destination === Destination.WEBHOOK &&
      !contact.webhookUrl?.trim());

  return (
    <Card size="small" title={t(`${KEY}.heading`)} className="mb-4">
      <Form.Item label={t(`${KEY}.title`)}>
        <Input
          allowClear
          maxLength={CONTACT_LIMITS.title}
          placeholder={t("storeSite.contact.formTitle")}
          value={contact.title ?? ""}
          onChange={(event) => set({ title: event.target.value || null })}
        />
      </Form.Item>

      <Form.Item label={t(`${KEY}.fields`)} extra={t(`${KEY}.fieldsHint`)}>
        <Space direction="vertical" className="w-full">
          {contact.fields.map(
            (asked: IStoreSiteContactField, index: number) => (
              <Card
                key={asked.key}
                size="small"
                type="inner"
                title={
                  <span className="truncate">
                    {asked.label?.trim() || t(`${KEY}.types.${asked.type}`)}
                  </span>
                }
                extra={
                  <Space size={2}>
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowUpOutlined />}
                      disabled={index === 0}
                      aria-label={t("storeSite.editor.moveUp")}
                      onClick={() => move(index, index - 1)}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowDownOutlined />}
                      disabled={index === contact.fields.length - 1}
                      aria-label={t("storeSite.editor.moveDown")}
                      onClick={() => move(index, index + 1)}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      // A form asks at least one thing.
                      disabled={contact.fields.length === 1}
                      aria-label={t("storeSite.editor.remove")}
                      onClick={() =>
                        onChange((current) => ({
                          fields: current.fields.filter(
                            (each: IStoreSiteContactField) =>
                              each.key !== asked.key,
                          ),
                        }))
                      }
                    />
                  </Space>
                }
              >
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
              </Card>
            ),
          )}
          <Button
            block
            type="dashed"
            icon={<PlusOutlined />}
            disabled={isFull}
            onClick={() =>
              onChange((current) => ({
                fields: [...current.fields, newContactField()],
              }))
            }
          >
            {t(`${KEY}.addField`)} ({contact.fields.length}/
            {StoreSitesEnum.MAX_CONTACT_FIELDS})
          </Button>
        </Space>
      </Form.Item>

      <Form.Item label={t(`${KEY}.buttonLabel`)}>
        <Input
          allowClear
          maxLength={CONTACT_LIMITS.buttonLabel}
          placeholder={t("storeSite.contact.send")}
          value={contact.buttonLabel ?? ""}
          onChange={(event) => set({ buttonLabel: event.target.value || null })}
        />
      </Form.Item>

      <Form.Item
        label={t(`${KEY}.successMessage`)}
        extra={t(`${KEY}.successMessageHint`)}
      >
        <Input.TextArea
          autoSize={{ minRows: 2, maxRows: 4 }}
          maxLength={CONTACT_LIMITS.successMessage}
          value={contact.successMessage ?? ""}
          onChange={(event) =>
            set({ successMessage: event.target.value || null })
          }
        />
      </Form.Item>

      <Form.Item
        label={t(`${KEY}.destination`)}
        extra={t(`${KEY}.destinationHints.${contact.destination}`)}
      >
        <Select<StoreSitesEnum.ContactDestination>
          value={contact.destination}
          onChange={(destination) => set({ destination })}
          options={Object.values(Destination).map(
            (destination: StoreSitesEnum.ContactDestination) => ({
              value: destination,
              label: t(`${KEY}.destinations.${destination}`),
            }),
          )}
        />
      </Form.Item>

      {contact.destination === Destination.EMAIL && (
        <Form.Item label={t(`${KEY}.email`)}>
          <Input
            type="email"
            allowClear
            maxLength={CONTACT_LIMITS.email}
            placeholder="voce@exemplo.com"
            value={contact.email ?? ""}
            onChange={(event) => set({ email: event.target.value || null })}
          />
        </Form.Item>
      )}

      {contact.destination === Destination.WHATSAPP && (
        <Form.Item
          label={t(`${KEY}.whatsapp`)}
          extra={t(`${KEY}.whatsappHint`)}
        >
          <Input
            allowClear
            inputMode="tel"
            maxLength={24}
            placeholder="55 85 99999 0000"
            value={contact.whatsapp ?? ""}
            onChange={(event) => set({ whatsapp: event.target.value || null })}
          />
        </Form.Item>
      )}

      {contact.destination === Destination.WEBHOOK && (
        <Form.Item
          label={t(`${KEY}.webhookUrl`)}
          extra={t(`${KEY}.webhookUrlHint`)}
        >
          <Input
            allowClear
            maxLength={CONTACT_LIMITS.webhookUrl}
            placeholder="https://"
            value={contact.webhookUrl ?? ""}
            onChange={(event) =>
              set({ webhookUrl: event.target.value || null })
            }
          />
        </Form.Item>
      )}

      {isMissingAddress && (
        <Alert type="warning" showIcon message={t(`${KEY}.missingAddress`)} />
      )}
    </Card>
  );
};

export default ContactFormFields;
