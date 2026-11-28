"use client";

import { Alert, Card, Collapse, Form, Input, Select } from "antd";

import { BorderOutlined, SendOutlined } from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  CONTACT_LIMITS,
  IStoreSiteContactBox,
  IStoreSiteContactButton,
  IStoreSiteContactForm,
  contactBoxOf,
  contactButtonOf,
} from "../../../shared/business/store-sites/store-site-contact";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import ContactBoxStyleFields from "./ContactBoxStyleFields";
import ContactButtonStyleFields from "./ContactButtonStyleFields";
import ContactFieldsList from "./ContactFieldsList";

interface Props {
  contact: IStoreSiteContactForm;
  /** Applied to the form as it is then. */
  onChange: (
    change: (current: IStoreSiteContactForm) => Partial<IStoreSiteContactForm>,
  ) => void;
  /** The card's heading; none, the contact page's. */
  heading?: string;
  /** Off where the heading over the form is the section's own. */
  withTitle?: boolean;
}

const KEY = "storeSite.editor.contactForm";

const Destination = StoreSitesEnum.ContactDestination;

/**
 * The form of the contact page: its words, what it asks (each field with its
 * kind, its name and whether it must be filled, in the order shown) and where
 * what a visitor writes goes.
 */
const ContactFormFields = ({
  contact,
  onChange,
  heading,
  withTitle = true,
}: Props) => {
  const { t } = useLanguageData();

  const set = (patch: Partial<IStoreSiteContactForm>): void =>
    onChange(() => patch);

  const setButton = (patch: Partial<IStoreSiteContactButton>): void =>
    onChange((current) => ({ button: { ...current.button, ...patch } }));

  const setBox = (patch: Partial<IStoreSiteContactBox>): void =>
    onChange((current) => ({ box: { ...current.box, ...patch } }));

  // The address the chosen destination needs, when it has none yet.
  const isMissingAddress: boolean =
    (contact.destination === Destination.EMAIL && !contact.email?.trim()) ||
    (contact.destination === Destination.WHATSAPP &&
      !contact.whatsapp?.trim()) ||
    (contact.destination === Destination.WEBHOOK &&
      !contact.webhookUrl?.trim());

  return (
    <Card size="small" title={heading ?? t(`${KEY}.heading`)} className="mb-4">
      {withTitle && (
        <Form.Item label={t(`${KEY}.title`)}>
          <Input
            allowClear
            maxLength={CONTACT_LIMITS.title}
            placeholder={t("storeSite.contact.formTitle")}
            value={contact.title ?? ""}
            onChange={(event) => set({ title: event.target.value || null })}
          />
        </Form.Item>
      )}

      <Form.Item label={t(`${KEY}.fields`)} extra={t(`${KEY}.fieldsHint`)}>
        <ContactFieldsList fields={contact.fields} onChange={onChange} />
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

      <Collapse
        size="small"
        className="mb-4"
        items={[
          {
            key: "button",
            label: (
              <span className="flex items-center gap-2">
                <SendOutlined />
                {t(`${KEY}.button.heading`)}
              </span>
            ),
            children: (
              <ContactButtonStyleFields
                button={contact.button}
                onChange={setButton}
                onReset={() => set({ button: contactButtonOf(null) })}
              />
            ),
          },
          {
            key: "box",
            label: (
              <span className="flex items-center gap-2">
                <BorderOutlined />
                {t(`${KEY}.box.heading`)}
              </span>
            ),
            children: (
              <ContactBoxStyleFields
                box={contact.box}
                onChange={setBox}
                onReset={() => set({ box: contactBoxOf(null) })}
              />
            ),
          },
        ]}
      />

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
