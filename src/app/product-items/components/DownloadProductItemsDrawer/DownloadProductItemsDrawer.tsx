import { useState } from "react";

import { Button, Card, Col, Drawer, Row, Select } from "antd";
import { map } from "lodash";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { DownloadOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import handleClientError from "../../../../components/common/HandleClientError/HandleClientError";
import SelectProducts from "../../../../components/common/SelectProducts/SelectProducts";
import { TagCategoryCustomAntd } from "../../../../components/common/TagCategoryCustomAntd/TagCategoryCustomAntd";
import { TagTagCustomAntd } from "../../../../components/common/TagTagCustomAntd/TagTagCustomAntd";
import { InputCustomAntd } from "../../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import { ICategory } from "../../../../shared/business/categories/categories.interface";
import ProductItemsEnum from "../../../../shared/business/product-items/product-items.enum";
import { IProduct } from "../../../../shared/business/products/products.interface";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import TableStateEnum from "../../../../shared/utils/table/table-state.enum";

const formSchema = z.object({
  search: z.string().nullable(),
  tagsIds: z.array(z.string()),
  categoriesIds: z.array(z.string()),
  storeIds: z.array(z.string()),
  productIds: z.array(z.string()),
  sortField: z.string().nullable(),
  sortOrder: z.string().nullable(),
  isActive: z.boolean().nullable(),
});

type TFormSchema = z.infer<typeof formSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  width?: string | number;
  tags: ITag[];
  categories: ICategory[];
  stores: IStore[];
  productId?: string;
}

export const DownloadProductItemsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  width = "50%",
  tags = [],
  categories = [],
  stores = [],
  productId,
}) => {
  const { t } = useLanguageData();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<TFormSchema>({
    values: {
      search: null,
      tagsIds: [],
      categoriesIds: [],
      storeIds: [],
      productIds: productId ? [productId] : [],
      isActive: null,
      sortField: ProductItemsEnum.SortField.createdAt,
      sortOrder: TableStateEnum.SortOrder.ascend,
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    try {
      setIsDownloading(true);

      const response: Buffer =
        await serviceMethodsInstance.productItemsServiceMethods.downloadProductItems(
          data as any
        );

      const url: string = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "fileDownloadProductItems.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Drawer title={title} onClose={onClose} open={isOpen} width={width}>
      <Card title={t("common.filter")}>
        <Row>
          <Col xs={24} sm={24}>
            <InputCustomAntd
              controller={{ control, name: "search" }}
              label={t("common.search")}
              placeholder={t("productItems.searchProductItems")}
              errorMessage={errors.search?.message}
              maxLength={200}
              allowClear
            />
          </Col>

          <Col xs={24} sm={12}>
            <div className="mt-4 mr-5">
              <SelectProducts
                label={"Products"}
                labelClassName="font-normal"
                selectedProductIds={watch("productIds")}
                onSelectProducts={(products: IProduct[]) => {
                  setValue("productIds", map(products, "_id"));
                }}
              />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <SelectCustomAntd
              controller={{ control, name: "storeIds" }}
              label={t("productItems.stores")}
              errorMessage={errors.storeIds?.message}
              placeholder={t("products.selectStores")}
              mode="multiple"
              allowClear
            >
              {stores.map((store: IStore) => (
                <Select.Option key={store._id} value={store._id}>
                  {store.name}
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={12}>
            <SelectCustomAntd
              controller={{ control, name: "tagsIds" }}
              label={t("productItems.tags")}
              errorMessage={errors.tagsIds?.message}
              placeholder={t("products.selectTags")}
              mode="multiple"
              allowClear
            >
              {tags.map((tag: ITag) => (
                <Select.Option key={tag._id} value={tag._id}>
                  <TagTagCustomAntd tag={tag} useTag={false} />
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={12}>
            <SelectCustomAntd
              controller={{ control, name: "categoriesIds" }}
              label={t("productItems.categories")}
              errorMessage={errors.categoriesIds?.message}
              placeholder={t("products.selectCategories")}
              mode="multiple"
              allowClear
            >
              {categories.map((category: ICategory) => (
                <Select.Option key={category._id} value={category._id}>
                  <TagCategoryCustomAntd category={category} useTag={false} />
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={8}>
            <SelectCustomAntd
              controller={{ control, name: "isActive" }}
              label={t("productItems.active")}
              errorMessage={errors.isActive?.message}
              placeholder={t("common.select")}
            >
              <Select.Option key={"SELECT_ALL"} value={null}>
                {t("common.select")}
              </Select.Option>
              <Select.Option key={"YES"} value={true}>
                {t("common.yes")}
              </Select.Option>
              <Select.Option key={"NO"} value={false}>
                {t("common.no")}
              </Select.Option>
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={8}>
            <SelectCustomAntd
              controller={{ control, name: "sortField" }}
              label={t("products.sortField")}
              errorMessage={errors.sortField?.message}
              placeholder={t("products.selectSortField")}
            >
              {Object.keys(ProductItemsEnum.SortField).map(
                (sortField: string) => (
                  <Select.Option key={sortField} value={sortField}>
                    {t(ProductItemsEnum.SortFieldLabels[sortField as ProductItemsEnum.SortField])}
                  </Select.Option>
                )
              )}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={8}>
            <SelectCustomAntd
              controller={{ control, name: "sortOrder" }}
              label={t("products.sortOrder")}
              errorMessage={errors.sortOrder?.message}
              placeholder={t("products.selectSortOrder")}
            >
              {Object.keys(TableStateEnum.SortOrder).map(
                (sortOrder: string) => (
                  <Select.Option key={sortOrder} value={sortOrder}>
                    {
                      TableStateEnum.SortOrderLabels[
                        sortOrder as TableStateEnum.SortOrder
                      ]
                    }
                  </Select.Option>
                )
              )}
            </SelectCustomAntd>
          </Col>
        </Row>
      </Card>

      <Button
        type="primary"
        onClick={handleSubmit(onSubmit)}
        icon={<DownloadOutlined />}
        className="mt-3 block w-full"
        loading={isDownloading}
        disabled={isDownloading}
      >
        {t("common.download")}
      </Button>
    </Drawer>
  );
};
