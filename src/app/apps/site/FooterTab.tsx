"use client";

import { Button, Card, Empty, Form, Input, Select, Space, Switch } from "antd";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  completeFooterUrl,
  IStoreSiteFooter,
  IStoreSiteFooterLink,
  IStoreSiteFooterSection,
} from "../../../shared/business/store-sites/store-site-footer";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
}

const TYPES: StoreSitesEnum.FooterLinkType[] = Object.values(
  StoreSitesEnum.FooterLinkType,
);

/**
 * The foot of the site: a few words, the button into the app, and as many
 * links as the owner wants (social networks, other sites, ways to get in touch).
 */
const FooterTab = ({ editor }: Props) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const { footer } = editor.draft;

  // From the draft as it is when applied, like every other change of the editor.
  const set = (patch: Partial<IStoreSiteFooter>): void =>
    editor.update((draft) => ({ footer: { ...draft.footer, ...patch } }));

  const setLink = (key: string, patch: Partial<IStoreSiteFooterLink>): void =>
    editor.update((draft) => ({
      footer: {
        ...draft.footer,
        links: draft.footer.links.map((link: IStoreSiteFooterLink) =>
          link.key === key ? { ...link, ...patch } : link,
        ),
      },
    }));

  const move = (from: number, to: number): void => {
    if (to < 0 || to >= footer.links.length) {
      return;
    }

    const links: IStoreSiteFooterLink[] = [...footer.links];

    links.splice(to, 0, links.splice(from, 1)[0]);

    set({ links });
  };

  const add = (): void =>
    set({
      links: [
        ...footer.links,
        {
          key: `l-${Date.now().toString(36)}`,
          type: StoreSitesEnum.FooterLinkType.INSTAGRAM,
          label: "",
          url: "",
          // Next to the last link added, which is where the next usually goes.
          section:
            footer.links[footer.links.length - 1]?.section ??
            footer.sections[footer.sections.length - 1].key,
        },
      ],
    });

  const sectionName = (
    section: IStoreSiteFooterSection,
    index: number,
  ): string =>
    section.title?.trim() ||
    `${t("storeSite.editor.footer.sections.section")} ${index + 1}`;

  const sectionOptions: { value: string; label: string }[] =
    footer.sections.map((section: IStoreSiteFooterSection, index: number) => ({
      value: section.key,
      label: sectionName(section, index),
    }));

  const setSection = (
    key: string,
    patch: Partial<IStoreSiteFooterSection>,
  ): void =>
    editor.update((draft) => ({
      footer: {
        ...draft.footer,
        sections: draft.footer.sections.map(
          (section: IStoreSiteFooterSection) =>
            section.key === key ? { ...section, ...patch } : section,
        ),
      },
    }));

  const addSection = (): void =>
    set({
      sections: [
        ...footer.sections,
        { key: `s-${Date.now().toString(36)}`, title: null },
      ],
    });

  // What was in a section that is removed moves to the first one that stays:
  // removing a column never removes what the owner put in it.
  const removeSection = (key: string): void =>
    editor.update((draft) => {
      const sections: IStoreSiteFooterSection[] = draft.footer.sections.filter(
        (section: IStoreSiteFooterSection) => section.key !== key,
      );

      const fallback: string = sections[0].key;

      const moved = (section: string): string =>
        section === key ? fallback : section;

      return {
        footer: {
          ...draft.footer,
          sections,
          textSection: moved(draft.footer.textSection),
          loginSection: moved(draft.footer.loginSection),
          links: draft.footer.links.map((link: IStoreSiteFooterLink) => ({
            ...link,
            section: moved(link.section),
          })),
        },
      };
    });

  const moveSection = (from: number, to: number): void => {
    if (to < 0 || to >= footer.sections.length) {
      return;
    }

    const sections: IStoreSiteFooterSection[] = [...footer.sections];

    sections.splice(to, 0, sections.splice(from, 1)[0]);

    set({ sections });
  };

  const canAddSection: boolean =
    footer.sections.length < StoreSitesEnum.MAX_FOOTER_SECTIONS;

  const isFull: boolean =
    footer.links.length >= StoreSitesEnum.MAX_FOOTER_LINKS;

  return (
    <Form layout="vertical">
      <Form.Item label={t("storeSite.editor.footer.show")}>
        <Switch
          checked={footer.isActive}
          onChange={(isActive: boolean) => set({ isActive })}
        />
      </Form.Item>

      {footer.isActive && (
        <>
          <div className="font-medium mb-1">
            {t("storeSite.editor.footer.sections.heading")}
          </div>
          <p className="text-xs opacity-70 mb-2">
            {t("storeSite.editor.footer.sections.hint")}
          </p>
          <Space direction="vertical" className="w-full mb-5">
            {footer.sections.map(
              (section: IStoreSiteFooterSection, index: number) => (
                <Space.Compact key={section.key} className="w-full">
                  <Input
                    maxLength={40}
                    addonBefore={index + 1}
                    placeholder={t(
                      "storeSite.editor.footer.sections.titlePlaceholder",
                    )}
                    value={section.title ?? ""}
                    onChange={(event) =>
                      setSection(section.key, {
                        title: event.target.value || null,
                      })
                    }
                  />
                  <Button
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    aria-label={t("storeSite.editor.moveUp")}
                    onClick={() => moveSection(index, index - 1)}
                  />
                  <Button
                    icon={<ArrowDownOutlined />}
                    disabled={index === footer.sections.length - 1}
                    aria-label={t("storeSite.editor.moveDown")}
                    onClick={() => moveSection(index, index + 1)}
                  />
                  <Button
                    danger
                    type="primary"
                    icon={<DeleteOutlined />}
                    disabled={footer.sections.length <= 1}
                    aria-label={t("storeSite.editor.remove")}
                    onClick={() => removeSection(section.key)}
                  />
                </Space.Compact>
              ),
            )}
            <Button
              icon={<PlusOutlined />}
              disabled={!canAddSection}
              onClick={addSection}
            >
              {t("storeSite.editor.footer.sections.add")} (
              {footer.sections.length}/{StoreSitesEnum.MAX_FOOTER_SECTIONS})
            </Button>
          </Space>

          <Form.Item label={t("storeSite.editor.footer.sections.textIn")}>
            <Select
              value={footer.textSection}
              options={sectionOptions}
              onChange={(textSection: string) => set({ textSection })}
            />
          </Form.Item>

          <Form.Item
            label={t("storeSite.editor.footer.text")}
            extra={t("storeSite.editor.footer.textHint")}
          >
            <Input.TextArea
              rows={3}
              maxLength={300}
              value={footer.text ?? ""}
              onChange={(event) => set({ text: event.target.value || null })}
            />
          </Form.Item>

          <Form.Item
            label={t("storeSite.editor.footer.login")}
            extra={t("storeSite.editor.footer.loginHint")}
          >
            <Switch
              checked={footer.isLoginVisible}
              onChange={(isLoginVisible: boolean) => set({ isLoginVisible })}
            />
          </Form.Item>

          {footer.isLoginVisible && (
            <Form.Item label={t("storeSite.editor.footer.sections.loginIn")}>
              <Select
                value={footer.loginSection}
                options={sectionOptions}
                onChange={(loginSection: string) => set({ loginSection })}
              />
            </Form.Item>
          )}

          <div className="font-medium mb-2">
            {t("storeSite.editor.footer.linksHeading")}
          </div>

          <Space direction="vertical" className="w-full">
            {footer.links.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("storeSite.editor.footer.empty")}
              />
            )}

            {footer.links.map((link: IStoreSiteFooterLink, index: number) => {
              // Typed but not an address the site can link to.
              const isInvalid: boolean =
                !!link.url.trim() && !completeFooterUrl(link.type, link.url);

              return (
                <Card
                  key={link.key}
                  size="small"
                  title={t(`storeSite.footer.types.${link.type}`)}
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
                        disabled={index === footer.links.length - 1}
                        aria-label={t("storeSite.editor.moveDown")}
                        onClick={() => move(index, index + 1)}
                      />
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        aria-label={t("storeSite.editor.remove")}
                        onClick={() =>
                          set({
                            links: footer.links.filter(
                              (other: IStoreSiteFooterLink) =>
                                other.key !== link.key,
                            ),
                          })
                        }
                      />
                    </Space>
                  }
                >
                  <Form.Item
                    label={t("storeSite.editor.footer.sections.linkIn")}
                  >
                    <Select
                      value={link.section}
                      options={sectionOptions}
                      onChange={(section: string) =>
                        setLink(link.key, { section })
                      }
                    />
                  </Form.Item>
                  <Form.Item label={t("storeSite.editor.footer.type")}>
                    <Select
                      value={link.type}
                      onChange={(type: StoreSitesEnum.FooterLinkType) =>
                        setLink(link.key, { type })
                      }
                      options={TYPES.map(
                        (type: StoreSitesEnum.FooterLinkType) => ({
                          value: type,
                          label: t(`storeSite.footer.types.${type}`),
                        }),
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t("storeSite.editor.footer.url")}
                    validateStatus={isInvalid ? "error" : undefined}
                    help={
                      isInvalid
                        ? t("storeSite.editor.footer.invalidUrl")
                        : undefined
                    }
                  >
                    <Input
                      maxLength={300}
                      placeholder={t(
                        `storeSite.editor.footer.placeholders.${link.type}`,
                      )}
                      value={link.url}
                      onChange={(event) =>
                        setLink(link.key, { url: event.target.value })
                      }
                      // Leaving the field completes it ("https://", a call, a chat),
                      // so the preview already shows the link as it will be.
                      onBlur={() => {
                        const completed: string | null = completeFooterUrl(
                          link.type,
                          link.url,
                        );

                        if (completed && completed !== link.url) {
                          setLink(link.key, { url: completed });
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    className="mb-0"
                    label={t("storeSite.editor.footer.label")}
                    extra={t("storeSite.editor.footer.labelHint")}
                  >
                    <Input
                      maxLength={40}
                      value={link.label}
                      onChange={(event) =>
                        setLink(link.key, { label: event.target.value })
                      }
                    />
                  </Form.Item>
                </Card>
              );
            })}

            <Button icon={<PlusOutlined />} disabled={isFull} onClick={add}>
              {t("storeSite.editor.footer.add")} ({footer.links.length}/
              {StoreSitesEnum.MAX_FOOTER_LINKS})
            </Button>
          </Space>
        </>
      )}
    </Form>
  );
};

export default FooterTab;
