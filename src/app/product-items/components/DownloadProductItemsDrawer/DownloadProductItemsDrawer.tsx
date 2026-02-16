import { useState } from 'react';

import {
  Button,
  Card,
  Col,
  Drawer,
  Row,
  Select,
} from 'antd';
import {
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { z } from 'zod';

import { DownloadOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';

import handleClientError
  from '../../../../components/common/handleClientError/handleClientError';
import SelectProducts
  from '../../../../components/common/SelectProducts/SelectProducts';
import {
  TagCategoryCustomAntd,
} from '../../../../components/common/TagCategoryCustomAntd/TagCategoryCustomAntd';
import {
  TagTagCustomAntd,
} from '../../../../components/common/TagTagCustomAntd/TagTagCustomAntd';
import {
  InputCustomAntd,
} from '../../../../components/custom/antd/InputCustomAntd/InputCustomAntd';
import {
  SelectCustomAntd,
} from '../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd';
import {
  serviceMethodsInstance,
} from '../../../../services/social-prices-api/service-methods';
import {
  ICategory,
} from '../../../../shared/business/categories/categories.interface';
import ProductItemsEnum
  from '../../../../shared/business/product-items/product-items.enum';
import {
  IProduct,
} from '../../../../shared/business/products/products.interface';
import { IStore } from '../../../../shared/business/stores/stores.interface';
import { ITag } from '../../../../shared/business/tags/tags.interface';
import TableStateEnum from '../../../../shared/utils/table/table-state.enum';

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
  selectedProducts?: IProduct[];
}

export const DownloadProductItemsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  width = "50%",
  tags = [],
  categories = [],
  stores = [],
  selectedProducts = [],
}) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [selectedProductsState, setSelectedProductsState] =
    useState<IProduct[]>(selectedProducts);

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<TFormSchema>({
    values: {
      search: null,
      tagsIds: [],
      categoriesIds: [],
      storeIds: [],
      productIds: selectedProducts.map((p) => p._id),
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
      <Card title="Filters">
        <Row>
          <Col xs={24} sm={24}>
            <InputCustomAntd
              controller={{ control, name: "search" }}
              label="Search"
              placeholder={"Search product items..."}
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
                selectedProductIds={selectedProductsState.map((p) => p._id)}
                onSelectProducts={(products: IProduct[]) => {
                  setSelectedProductsState(products);
                  setValue(
                    "productIds",
                    products.map((p) => p._id)
                  );
                }}
              />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <SelectCustomAntd
              controller={{ control, name: "storeIds" }}
              label="Stores"
              errorMessage={errors.storeIds?.message}
              placeholder={"Select stores"}
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
              label="Tags"
              errorMessage={errors.tagsIds?.message}
              placeholder={"Select tags"}
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
              label="Categories"
              errorMessage={errors.categoriesIds?.message}
              placeholder={"Select categories"}
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
              label="Active"
              errorMessage={errors.isActive?.message}
              placeholder={"Select is active"}
            >
              <Select.Option key={"SELECT_ALL"} value={null}>
                - Select -
              </Select.Option>
              <Select.Option key={"YES"} value={true}>
                Yes
              </Select.Option>
              <Select.Option key={"NO"} value={false}>
                No
              </Select.Option>
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={8}>
            <SelectCustomAntd
              controller={{ control, name: "sortField" }}
              label="Sort Field"
              errorMessage={errors.sortField?.message}
              placeholder={"Select sort field"}
            >
              {Object.keys(ProductItemsEnum.SortField).map(
                (sortField: string) => (
                  <Select.Option key={sortField} value={sortField}>
                    {
                      ProductItemsEnum.SortFieldLabels[
                        sortField as ProductItemsEnum.SortField
                      ]
                    }
                  </Select.Option>
                )
              )}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={8}>
            <SelectCustomAntd
              controller={{ control, name: "sortOrder" }}
              label="Sort Order"
              errorMessage={errors.sortOrder?.message}
              placeholder={"Select sort order"}
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
        Download
      </Button>
    </Drawer>
  );
};
