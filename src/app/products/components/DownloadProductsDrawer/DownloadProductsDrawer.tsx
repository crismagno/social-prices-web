import { useState } from "react";

import { Button, Card, Col, Drawer, Row, Select } from "antd";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { DownloadOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import handleClientError from "../../../../components/common/HandleClientError/HandleClientError";
import { TagCategoryCustomAntd } from "../../../../components/common/TagCategoryCustomAntd/TagCategoryCustomAntd";
import { TagTagCustomAntd } from "../../../../components/common/TagTagCustomAntd/TagTagCustomAntd";
import { InputCustomAntd } from "../../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import { ICategory } from "../../../../shared/business/categories/categories.interface";
import ProductsEnum from "../../../../shared/business/products/products.enum";
import { IFiltersDownloadProducts } from "../../../../shared/business/products/products.type";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import TableStateEnum from "../../../../shared/utils/table/table-state.enum";

const formSchema = z.object({
  search: z.string().nullable(),
  gender: z.string().nullable(),
  tagsIds: z.array(z.string()),
  categoriesIds: z.array(z.string()),
  storeIds: z.array(z.string()),
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
}

export const DownloadProductsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  width = "50%",
  tags = [],
  categories = [],
  stores = [],
}) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const { t } = useLanguageData();

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<TFormSchema>({
    values: {
      gender: null,
      search: null,
      tagsIds: [],
      categoriesIds: [],
      storeIds: [],
      isActive: null,
      sortField: ProductsEnum.SortField.createdAt,
      sortOrder: TableStateEnum.SortOrder.ascend,
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    try {
      setIsDownloading(true);

      const response: Buffer =
        await serviceMethodsInstance.productsServiceMethods.downloadProducts(
          data as IFiltersDownloadProducts
        );

      const url: string = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "fileDownloadProducts.xlsx");
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
              placeholder={t("products.searchProducts")}
              errorMessage={errors.search?.message}
              maxLength={200}
              allowClear
            />
          </Col>

          <Col xs={24} sm={8}>
            <SelectCustomAntd
              controller={{ control, name: "tagsIds" }}
              label="Tags"
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

          <Col xs={24} sm={8}>
            <SelectCustomAntd
              controller={{ control, name: "categoriesIds" }}
              label="Categories"
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
              controller={{ control, name: "storeIds" }}
              label="Stores"
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

          <Col xs={24} sm={8}>
            <SelectCustomAntd
              controller={{ control, name: "isActive" }}
              label={t("common.active")}
              errorMessage={errors.isActive?.message}
              placeholder={t("products.isActive")}
            >
              <Select.Option key={"SELECT_ALL"} value={null}>
                - Select -
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
              {Object.keys(ProductsEnum.SortField).map((sortField: string) => (
                <Select.Option key={sortField} value={sortField}>
                  {
                    ProductsEnum.SortFieldLabels[
                      sortField as ProductsEnum.SortField
                    ]
                  }
                </Select.Option>
              ))}
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
