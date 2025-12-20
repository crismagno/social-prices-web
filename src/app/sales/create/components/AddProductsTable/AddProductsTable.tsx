import { useEffect, useState } from "react";

import {
  Button,
  Col,
  Divider,
  Empty,
  Image,
  message,
  Row,
  Select,
  Tooltip,
} from "antd";
import { find, includes, map } from "lodash";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PlusOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import { TagCategoryCustomAntd } from "../../../../../components/common/TagCategoryCustomAntd/TagCategoryCustomAntd";
import { TagTagCustomAntd } from "../../../../../components/common/TagTagCustomAntd/TagTagCustomAntd";
import { InputNumberCustomAntd } from "../../../../../components/custom/antd/InputNumberCustomAntd/InputNumberCustomAntd";
import TableCustomAntd2 from "../../../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import CategoriesEnum from "../../../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../../../shared/business/categories/categories.interface";
import { IProduct } from "../../../../../shared/business/products/products.interface";
import { IStore } from "../../../../../shared/business/stores/stores.interface";
import TagsEnum from "../../../../../shared/business/tags/tags.enum";
import { ITag } from "../../../../../shared/business/tags/tags.interface";
import { sortArray } from "../../../../../shared/utils/array/array-functions";
import { getImageUrl } from "../../../../../shared/utils/images/images-url";
import ImagesEnum from "../../../../../shared/utils/images/images.enum";
import {
  formatterMoney,
  parserMoney,
} from "../../../../../shared/utils/strings/string";
import { createTableState } from "../../../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../../../shared/utils/table/table-state.interface";
import { useFindCategoriesByType } from "../../../../categories/useFindCategoriesByType";
import { AddProductButton } from "../../../../products/components/AddProductButton/AddProductButton";
import { useFindProductsByUserTableState } from "../../../../products/useFindProductsByUserTableState";
import { useFindTagsByType } from "../../../../tags/useFindTagsByType";

const productFormSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  price: z.number(),
});

type TProductFormSchema = z.infer<typeof productFormSchema>;

const formSchema = z.object({
  products: z.array(productFormSchema),
});

type TFormSchema = z.infer<typeof formSchema>;

export interface IProductToAddOnSale {
  productId: string;
  barcode: string;
  quantity: number;
  price: number;
  name: string;
  fileUrl: string | null;
}

export interface IStoreProductToAddOnSale {
  storeId: string;
  product: IProductToAddOnSale;
}

interface Props {
  selectedStoreIds: string[];
  stores: IStore[];
  onAddProductToSale: (productToAddOnSale: IStoreProductToAddOnSale) => void;
}

export const AddProductsTable: React.FC<Props> = ({
  selectedStoreIds,
  stores,
  onAddProductToSale,
}) => {
  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IProduct> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const [formValues, setFormValues] = useState<TFormSchema>();

  const [categoriesIds, setCategoriesIds] = useState<string[]>([]);

  const [tagsIds, setTagsIds] = useState<string[]>([]);

  const [isActive, setIsActive] = useState<Array<boolean | null>>();

  const { control, getValues } = useForm<TFormSchema>({
    values: formValues,
    resolver: zodResolver(formSchema),
  });

  const { isLoading, products, total, fetchFindProductsByUserTableState } =
    useFindProductsByUserTableState(tableStateRequest);

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.PRODUCT);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.SALE
  );

  useEffect(() => {
    setFormValues({
      products: map(
        products,
        (product: IProduct): TProductFormSchema => ({
          price: product.price,
          productId: product._id,
          quantity: 1,
        })
      ),
    });
  }, [products]);

  useEffect(() => {
    setTableStateRequest({
      ...tableStateRequest,
      filters: { storeIds: selectedStoreIds, categoriesIds, tagsIds, isActive },
    });
  }, [selectedStoreIds, categoriesIds, tagsIds, isActive]);

  const getStore = (storeId: string): IStore | undefined =>
    find(stores, { _id: storeId });

  if (!selectedStoreIds?.length) {
    return <Empty />;
  }

  const handleAddProductToSale = (productId: string, storeId: string) => {
    const product: IProduct | undefined = find(products, {
      _id: productId,
    });

    if (!product) {
      message.error("Product not found");
      return;
    }

    const productForm: TProductFormSchema | undefined = find(
      getValues("products"),
      { productId }
    );

    if (!productForm) {
      message.error("Product not found");
      return;
    }

    if (productForm.quantity <= 0) {
      message.warning("Product quantity invalid");
      return;
    }

    onAddProductToSale?.({
      storeId,
      product: {
        price: productForm.price ?? 0,
        productId,
        quantity: productForm.quantity,
        barcode: product.barcode ?? "",
        fileUrl: product.filesUrl?.[0] ?? null,
        name: product.name,
      },
    });
  };

  const handleAddProductToSaleByCreate = async (product: IProduct | null) => {
    if (product == null) {
      return;
    }

    await fetchFindProductsByUserTableState();

    let storeId: string = product.storeIds[0];

    if (selectedStoreIds.length) {
      storeId =
        find(product.storeIds, (productStoreId: string) =>
          includes(selectedStoreIds, productStoreId)
        ) ?? selectedStoreIds[0];
    }

    onAddProductToSale?.({
      storeId,
      product: {
        price: product.price ?? 0,
        productId: product._id,
        quantity: 1,
        barcode: product.barcode ?? "",
        fileUrl: product.filesUrl?.[0] ?? null,
        name: product.name,
      },
    });
  };

  return (
    <div>
      <Row gutter={[4, 4]}>
        <Col md={8}>
          <Select
            onChange={setCategoriesIds}
            allowClear
            placeholder={"Filter by Categories"}
            mode="multiple"
            style={{ width: "100%" }}
          >
            {map(categories, (category: ICategory) => (
              <Select.Option key={category._id} value={category._id}>
                <TagCategoryCustomAntd category={category} useTag={false} />
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col md={8}>
          <Select
            onChange={setTagsIds}
            allowClear
            placeholder={"Filter by Tags"}
            mode="multiple"
            style={{ width: "100%" }}
          >
            {map(sortArray(tags, "name"), (tag: ITag) => (
              <Select.Option key={tag._id} value={tag._id}>
                <TagTagCustomAntd tag={tag} useTag={false} />
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col md={3}>
          <Select
            defaultValue={null}
            onChange={(value: boolean | null) =>
              setIsActive(value == null ? [] : [value])
            }
            placeholder={"Filter by Active"}
            style={{ width: "100%" }}
          >
            <Select.Option key={"BOTH"} value={null}>
              Both
            </Select.Option>

            <Select.Option key={"ACTIVE"} value={true}>
              Active
            </Select.Option>

            <Select.Option key={"INACTIVE"} value={false}>
              Inactive
            </Select.Option>
          </Select>
        </Col>

        <Col md={5} className="flex justify-end">
          <AddProductButton
            buttonProps={{ text: "Add Product" }}
            onCreate={handleAddProductToSaleByCreate}
          />
        </Col>
      </Row>

      <TableCustomAntd2<IProduct>
        rowKey={"_id"}
        tableStateRequest={tableStateRequest}
        setTableStateRequest={setTableStateRequest}
        dataSource={products}
        columns={[
          {
            title: "Product",
            dataIndex: "filesUrl",
            key: "filesUrl",
            align: "center",
            render: (filesUrl: string[], product: IProduct) => {
              const fileUrl: string = filesUrl?.length
                ? getImageUrl(filesUrl[0])
                : ImagesEnum.FilesNames.DefaultAvatarImage;

              return (
                <div className="flex items-center">
                  <div className="mr-2">
                    <Image
                      key={`${fileUrl}-${Date.now()}`}
                      width={50}
                      height={50}
                      src={fileUrl}
                      onError={() => (
                        <Image
                          width={50}
                          height={50}
                          src={ImagesEnum.FilesNames.DefaultAvatarImage}
                          alt="mainUrl"
                          className="rounded-full"
                        />
                      )}
                      alt="mainUrl"
                      className="rounded-full"
                    />
                  </div>

                  <div className="flex flex-col text-start">
                    <span className="text-lg">{product.name}</span>
                    <span className="text-xs">{product.barcode}</span>
                  </div>
                </div>
              );
            },
          },
          {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
            render: (quantity: number, _, index: number) => {
              return (
                <div className="flex flex-col items-center">
                  <span className={quantity <= 0 ? "text-red-600" : ""}>
                    Current: {quantity}
                  </span>

                  <Divider style={{ margin: "7px 0px" }} />

                  <InputNumberCustomAntd
                    divClassName="w-28"
                    min={1}
                    controller={{
                      control,
                      name: `products.${index}.quantity`,
                    }}
                  />
                </div>
              );
            },
          },
          {
            title: "Price",
            dataIndex: "price",
            key: "price",
            align: "center",
            render: (price: number, _, index: number) => {
              return (
                <div className="flex flex-col justify-center items-center">
                  <span>Current: R${price}</span>

                  <Divider style={{ margin: "7px 0px" }} />

                  <InputNumberCustomAntd
                    divClassName="w-28"
                    formatter={formatterMoney}
                    parser={parserMoney}
                    min={0}
                    controller={{
                      control,
                      name: `products.${index}.price`,
                    }}
                  />
                </div>
              );
            },
          },
          {
            title: "Action",
            dataIndex: "storeIds",
            key: "storeIds",
            align: "center",
            render: (storeIds: string[], product: IProduct) => {
              return storeIds.map((storeId: string) => {
                const store: IStore | undefined = getStore(storeId);

                const isSelectedStore: boolean = includes(
                  selectedStoreIds,
                  store?._id
                );

                if (!store || !isSelectedStore) {
                  return null;
                }

                return (
                  <Tooltip
                    key={storeId}
                    title={`Add product by store "${store.name}"`}
                  >
                    <Button
                      size="middle"
                      className="mr-1 mt-1"
                      type="primary"
                      onClick={() =>
                        handleAddProductToSale(product._id, storeId)
                      }
                      icon={<PlusOutlined />}
                    >
                      {store.name}
                    </Button>
                  </Tooltip>
                );
              });
            },
          },
        ]}
        search={{ placeholder: "Search products.." }}
        loading={isLoading || isLoadingCategories || isLoadingTags}
        total={total}
        className="overflow-auto"
      />
    </div>
  );
};
