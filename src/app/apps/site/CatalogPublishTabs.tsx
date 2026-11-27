"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  App,
  Button,
  Card,
  Form,
  Input,
  List,
  Space,
  Switch,
  Tag,
} from "antd";

import {
  AppstoreAddOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  DeleteOutlined,
  ExportOutlined,
  HolderOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IProduct } from "../../../shared/business/products/products.interface";
import {
  CATALOG_ADD_LABEL_MAX,
  CATALOG_TITLE_MAX,
  IStoreSiteCatalog,
  siteCatalogOf,
} from "../../../shared/business/store-sites/store-site-catalog";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import ImageLookCard from "./ImageLookCard";
import ChoiceList from "./ChoiceList";
import ProductPickerModal from "./ProductPickerModal";
import SizeFields from "./SizeFields";
import useDragReorder from "./useDragReorder";
import { IStoreSiteEditor, slugify } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
  storeId: string;
}

// What a product may show, in the order the choices are listed.
type TCatalogSwitch = {
  [K in keyof IStoreSiteCatalog]: IStoreSiteCatalog[K] extends boolean
    ? K
    : never;
}[keyof IStoreSiteCatalog];

const CATALOG_CHOICES: TCatalogSwitch[] = [
  "isTitleShown",
  "isNameShown",
  "isPriceShown",
  "isDescriptionShown",
  "isAddButtonShown",
  "isDetailsOpened",
  "isSearchShown",
];

/** Which products the site sells, in the order they are shown. */
export const ProductsTab = ({ editor }: Omit<Props, "storeId">) => {
  const { t } = useLanguageData();

  const [isPicking, setIsPicking] = useState<boolean>(false);

  // From the draft as it is when the item is dropped.
  const drag = useDragReorder((from: number, to: number) =>
    editor.update((draft) => {
      const next: string[] = [...draft.productIds];

      next.splice(to, 0, next.splice(from, 1)[0]);

      return { productIds: next };
    }),
  );

  if (!editor.draft) {
    return null;
  }

  const { productIds } = editor.draft;

  const catalog: IStoreSiteCatalog = siteCatalogOf(editor.draft.catalog);

  const productById: Map<string, IProduct> = new Map(
    editor.storeProducts.map((product: IProduct) => [product._id, product]),
  );

  const swap = (from: number, to: number): void => {
    const next: string[] = [...productIds];

    next.splice(to, 0, next.splice(from, 1)[0]);

    editor.update({ productIds: next });
  };

  return (
    <Space direction="vertical" className="w-full">
      <Card size="small" title={t("storeSite.editor.catalog.heading")}>
        <Space direction="vertical" className="w-full">
          {CATALOG_CHOICES.map((choice: TCatalogSwitch) => (
            <label
              key={choice}
              className="flex items-center justify-between gap-3"
            >
              <span>{t(`storeSite.editor.catalog.${choice}`)}</span>
              <Switch
                checked={catalog[choice]}
                onChange={(isOn: boolean) =>
                  editor.update({ catalog: { ...catalog, [choice]: isOn } })
                }
              />
            </label>
          ))}
          {catalog.isDetailsOpened && (
            <Form.Item
              className="mb-0"
              label={t("storeSite.editor.catalog.detailsMode")}
            >
              <ChoiceList<StoreSitesEnum.ProductDetailsMode>
                value={catalog.detailsMode}
                onChange={(detailsMode) =>
                  editor.update({ catalog: { ...catalog, detailsMode } })
                }
                options={Object.values(StoreSitesEnum.ProductDetailsMode).map(
                  (mode: StoreSitesEnum.ProductDetailsMode) => ({
                    value: mode,
                    label: t(`storeSite.editor.catalog.detailsModes.${mode}`),
                    hint: t(
                      `storeSite.editor.catalog.detailsModeHints.${mode}`,
                    ),
                  }),
                )}
              />
            </Form.Item>
          )}
          {catalog.isTitleShown && (
            <Form.Item
              className="mb-0"
              label={t("storeSite.editor.catalog.title")}
            >
              <Input
                maxLength={CATALOG_TITLE_MAX}
                placeholder={t("storeSite.public.products")}
                value={catalog.title ?? ""}
                onChange={(event) =>
                  editor.update({
                    catalog: { ...catalog, title: event.target.value || null },
                  })
                }
              />
            </Form.Item>
          )}
          {catalog.isAddButtonShown && (
            <Form.Item
              className="mb-0"
              label={t("storeSite.editor.catalog.addLabel")}
            >
              <Input
                maxLength={CATALOG_ADD_LABEL_MAX}
                placeholder={t("storeSite.public.add")}
                value={catalog.addLabel ?? ""}
                onChange={(event) =>
                  editor.update({
                    catalog: {
                      ...catalog,
                      addLabel: event.target.value || null,
                    },
                  })
                }
              />
            </Form.Item>
          )}
          <span className="text-xs opacity-60">
            {t("storeSite.editor.catalog.hint")}
          </span>
        </Space>
      </Card>
      <Card size="small" title={t("storeSite.editor.sizes.productsHeading")}>
        <SizeFields
          editor={editor}
          className=""
          sizes={["productWidth", "productImageHeight", "productNameSize"]}
        />
      </Card>
      <ImageLookCard editor={editor} place="product" />
      {editor.storeProducts.length === 0 && (
        <Alert
          type="info"
          showIcon
          message={t("storeSite.editor.products.none")}
        />
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm opacity-70">
          {t("storeSite.editor.products.count")
            .replace("{count}", String(productIds.length))
            .replace("{max}", String(StoreSitesEnum.MAX_PRODUCTS))}
        </span>
        <Button
          type="primary"
          icon={<AppstoreAddOutlined />}
          disabled={!editor.storeProducts.length}
          onClick={() => setIsPicking(true)}
        >
          {t("storeSite.editor.products.pick")}
        </Button>
      </div>
      <ProductPickerModal
        open={isPicking}
        products={editor.storeProducts}
        chosenIds={productIds}
        onClose={() => setIsPicking(false)}
        onApply={(next: string[]) => editor.update({ productIds: next })}
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
              {...drag.itemProps(index)}
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
              <span className="flex min-w-0 items-center gap-2">
                <HolderOutlined
                  className="opacity-50"
                  title={t("storeSite.editor.dragToReorder")}
                />
                {product ? (
                  <>
                    <span
                      className="w-8 h-8 shrink-0 rounded-md bg-gray-100 dark:bg-gray-800 bg-center bg-cover"
                      style={
                        product.mainUrl
                          ? {
                              backgroundImage: `url("${getImageUrl(product.mainUrl)}")`,
                            }
                          : undefined
                      }
                    />
                    <span className="truncate">{product.name}</span>
                  </>
                ) : (
                  // Switched off or moved to another store since it was chosen.
                  <Tag color="warning">
                    {t("storeSite.editor.products.unavailable")}
                  </Tag>
                )}
              </span>
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
