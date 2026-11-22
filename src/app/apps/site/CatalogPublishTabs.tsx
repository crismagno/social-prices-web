"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  App,
  Button,
  Form,
  Input,
  List,
  Select,
  Space,
  Tag,
} from "antd";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  DeleteOutlined,
  ExportOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IProduct } from "../../../shared/business/products/products.interface";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import { IStoreSiteEditor, slugify } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
  storeId: string;
}

/** Which products the site sells, in the order they are shown. */
export const ProductsTab = ({ editor }: Omit<Props, "storeId">) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const { productIds } = editor.draft;

  const productById: Map<string, IProduct> = new Map(
    editor.storeProducts.map((product: IProduct) => [product._id, product]),
  );

  const swap = (from: number, to: number): void => {
    const next: string[] = [...productIds];

    next.splice(to, 0, next.splice(from, 1)[0]);

    editor.update({ productIds: next });
  };

  const isFull: boolean = productIds.length >= StoreSitesEnum.MAX_PRODUCTS;

  return (
    <Space direction="vertical" className="w-full">
      {editor.storeProducts.length === 0 && (
        <Alert
          type="info"
          showIcon
          message={t("storeSite.editor.products.none")}
        />
      )}
      <Select
        className="w-full"
        showSearch
        optionFilterProp="label"
        value={null}
        disabled={isFull}
        placeholder={`${t("storeSite.editor.products.add")} (${productIds.length}/${
          StoreSitesEnum.MAX_PRODUCTS
        })`}
        options={editor.storeProducts
          .filter((product: IProduct) => !productIds.includes(product._id))
          .map((product: IProduct) => ({
            value: product._id,
            label: product.name,
          }))}
        onChange={(productId: string | null) =>
          productId && editor.update({ productIds: [...productIds, productId] })
        }
      />
      <List
        size="small"
        bordered
        locale={{ emptyText: t("storeSite.editor.products.empty") }}
        dataSource={productIds}
        renderItem={(productId: string, index: number) => {
          const product: IProduct | undefined = productById.get(productId);

          return (
            <List.Item
              actions={[
                <Button
                  key="up"
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={index === 0}
                  aria-label={t("storeSite.editor.moveUp")}
                  onClick={() => swap(index, index - 1)}
                />,
                <Button
                  key="down"
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={index === productIds.length - 1}
                  aria-label={t("storeSite.editor.moveDown")}
                  onClick={() => swap(index, index + 1)}
                />,
                <Button
                  key="remove"
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={t("storeSite.editor.remove")}
                  onClick={() =>
                    editor.update({
                      productIds: productIds.filter(
                        (id: string) => id !== productId,
                      ),
                    })
                  }
                />,
              ]}
            >
              {product ? (
                product.name
              ) : (
                // Switched off or moved to another store since it was chosen.
                <Tag color="warning">
                  {t("storeSite.editor.products.unavailable")}
                </Tag>
              )}
            </List.Item>
          );
        }}
      />
    </Space>
  );
};

/** The address of the site and whether it is online. */
export const PublishTab = ({ editor, storeId }: Props) => {
  const { t } = useLanguageData();
  const { message } = App.useApp();

  const slug: string = editor.draft?.slug ?? "";

  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const isValid: boolean = StoreSitesEnum.SLUG_REGEX.test(slug);

  useEffect(() => {
    setIsAvailable(null);

    if (!isValid) {
      return;
    }

    let isCurrent: boolean = true;

    const timer: number = window.setTimeout(async () => {
      try {
        const available: boolean =
          await serviceMethodsInstance.storeSitesServiceMethods.isSlugAvailable(
            slug,
            storeId,
          );

        if (isCurrent) {
          setIsAvailable(available);
        }
      } catch {
        // Saving checks it again: the hint is only a convenience.
      }
    }, 400);

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [slug, storeId, isValid]);

  if (!editor.draft) {
    return null;
  }

  const isTaken: boolean = isAvailable === false || !!editor.slugError;

  const savedSlug: string | undefined = editor.saved?.slug;

  const siteUrl: string | null = savedSlug
    ? `${window.location.origin}${Urls.SITE.replace(":slug", savedSlug)}`
    : null;

  const help: string | undefined = !isValid
    ? t("storeSite.editor.publish.slugInvalid")
    : isTaken
      ? t("storeSite.editor.publish.slugTaken")
      : isAvailable
        ? t("storeSite.editor.publish.slugAvailable")
        : undefined;

  return (
    <Form layout="vertical">
      <Form.Item
        label={t("storeSite.editor.publish.slug")}
        validateStatus={
          !isValid || isTaken ? "error" : isAvailable ? "success" : undefined
        }
        help={help}
      >
        <Input
          addonBefore="/site/"
          maxLength={40}
          value={slug}
          onChange={(event) =>
            editor.update({
              slug: event.target.value
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "-"),
            })
          }
          onBlur={() => editor.update({ slug: slugify(slug) })}
        />
      </Form.Item>

      {siteUrl ? (
        <Form.Item label={t("storeSite.editor.publish.address")}>
          <Space.Compact className="w-full">
            <Input readOnly value={siteUrl} />
            <Button
              icon={<CopyOutlined />}
              aria-label={t("storeSite.editor.publish.copy")}
              onClick={async () => {
                await navigator.clipboard.writeText(siteUrl);
                message.success(t("storeSite.editor.publish.copied"));
              }}
            />
            {editor.saved?.isPublished && (
              <Button
                icon={<ExportOutlined />}
                aria-label={t("storeSite.editor.publish.open")}
                onClick={() => window.open(siteUrl, "_blank", "noopener")}
              />
            )}
          </Space.Compact>
        </Form.Item>
      ) : (
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message={t("storeSite.editor.publish.saveFirst")}
        />
      )}

      {editor.saved && (
        <Space direction="vertical">
          <Tag color={editor.saved.isPublished ? "green" : "default"}>
            {editor.saved.isPublished
              ? t("storeSite.editor.publish.online")
              : t("storeSite.editor.publish.offline")}
          </Tag>
          {editor.isDirty && (
            <Alert
              type="warning"
              showIcon
              message={t("storeSite.editor.publish.unsavedHint")}
            />
          )}
          {editor.saved.isPublished ? (
            <Button
              type="primary"
              danger
              loading={editor.isSaving}
              onClick={editor.unpublish}
            >
              {t("storeSite.editor.publish.unpublish")}
            </Button>
          ) : (
            <Button
              type="primary"
              loading={editor.isSaving}
              disabled={editor.isDirty}
              onClick={editor.publish}
            >
              {t("storeSite.editor.publish.publish")}
            </Button>
          )}
        </Space>
      )}
    </Form>
  );
};
