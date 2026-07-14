import { useEffect, useState } from "react";

import {
  App,
  Button,
  Col,
  Divider,
  Empty,
  Image,
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
import useLanguageData from "../../../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../../../services/social-prices-api/service-methods";
import CategoriesEnum from "../../../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../../../shared/business/categories/categories.interface";
import { IProductItem } from "../../../../../shared/business/product-items/product-items.interface";
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
import { SelectProductItemModal } from "../SelectProductItemModal/SelectProductItemModal";

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
  sku: string | null;
  productItemId: string;
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
  const { message } = App.useApp();
  const { t } = useLanguageData();
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
    TagsEnum.Type.SALE,
  );

  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const [isSelectProductItemModalOpen, setIsSelectProductItemModalOpen] =
    useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [productItems, setProductItems] = useState<IProductItem[]>([]);
  const [pendingStoreId, setPendingStoreId] = useState<string | null>(null);

  useEffect(() => {
    setFormValues({
      products: map(
        products,
        (product: IProduct): TProductFormSchema => ({
          price: product.price,
          productId: product._id,
          quantity: 1,
        }),
      ),
    });
    setExpandedRowKeys(map(products, "_id"));
  }, [products]);

  useEffect(() => {
    setTableStateRequest((prevState) => ({
      ...prevState,
      filters: { storeIds: selectedStoreIds, categoriesIds, tagsIds, isActive },
    }));
  }, [selectedStoreIds, categoriesIds, tagsIds, isActive]);

  const getStore = (storeId: string): IStore | undefined =>
    find(stores, { _id: storeId });

  if (!selectedStoreIds?.length) {
    return <Empty />;
  }

  const handleAddProductToSale = async (productId: string, storeId: string) => {
    let product: IProduct | null = find(products, {
      _id: productId,
    }) as IProduct | null;

    // If product is not found in the current list, fetch it from the API
    if (!product) {
      try {
        product =
          await serviceMethodsInstance.productsServiceMethods.findById(
            productId,
          );
      } catch (error) {
        message.error(t("sales.productNotFound"));
        return;
      }
    }

    if (!product) {
      message.error(t("sales.productNotFound"));
      return;
    }

    const productForm: TProductFormSchema | undefined = find(
      getValues("products"),
      { productId },
    );

    // If product form is not found, use default values
    const quantity = productForm?.quantity ?? 1;
    const price = productForm?.price ?? product.price;

    if (quantity <= 0) {
      message.warning(t("sales.productQuantityInvalid"));
      return;
    }

    try {
      const productItemsResponse: IProductItem[] =
        await serviceMethodsInstance.productItemsServiceMethods.findByProduct(
          productId,
        );

      const activeProductItems: IProductItem[] = productItemsResponse.filter(
        (item) => item.isActive,
      );

      if (activeProductItems.length === 0) {
        message.warning(t("sales.productHasNoActiveProductItems"));
        return;
      }

      if (activeProductItems.length === 1) {
        const productItem = activeProductItems[0];
        onAddProductToSale?.({
          storeId,
          product: {
            price: price ?? productItem.price,
            productId,
            quantity: quantity,
            barcode: productItem.barcode ?? "",
            fileUrl: productItem.filesUrl?.[0] ?? product.filesUrl?.[0] ?? null,
            name: productItem.name,
            sku: productItem.sku ?? null,
            productItemId: productItem._id,
          },
        });
        message.success(t("sales.productAddedToSaleSuccessfully"));
      } else {
        setSelectedProduct(product);
        setProductItems(activeProductItems);
        setPendingStoreId(storeId);
        setIsSelectProductItemModalOpen(true);
      }
    } catch (error) {
      message.error(t("sales.errorLoadingProductItems"));
      console.error(error);
    }
  };

  const handleSelectProductItem = (productItem: IProductItem) => {
    if (!selectedProduct || !pendingStoreId) return;

    const productForm: TProductFormSchema | undefined = find(
      getValues("products"),
      { productId: selectedProduct._id },
    );

    if (!productForm) {
      message.error(t("sales.productNotFound"));
      return;
    }

    onAddProductToSale?.({
      storeId: pendingStoreId,
      product: {
        price: productForm.price ?? productItem.price,
        productId: selectedProduct._id,
        quantity: productForm.quantity,
        barcode: productItem.barcode ?? "",
        fileUrl:
          productItem.filesUrl?.[0] ?? selectedProduct.filesUrl?.[0] ?? null,
        name: productItem.name,
        sku: productItem.sku ?? null,
        productItemId: productItem._id,
      },
    });

    message.success(t("sales.productAddedToSaleSuccessfully"));

    setSelectedProduct(null);
    setProductItems([]);
    setPendingStoreId(null);
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
          includes(selectedStoreIds, productStoreId),
        ) ?? selectedStoreIds[0];
    }

    await handleAddProductToSale(product._id, storeId);
  };

  return (
    <div>
      <Row gutter={[4, 4]}>
        <Col md={8}>
          <Select
            onChange={setCategoriesIds}
            allowClear
            placeholder={t("sales.filterByCategories")}
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
            placeholder={t("sales.filterByTags")}
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
            placeholder={t("sales.filterByActive")}
            style={{ width: "100%" }}
          >
            <Select.Option key={"BOTH"} value={null}>
              {t("sales.both")}
            </Select.Option>

            <Select.Option key={"ACTIVE"} value={true}>
              {t("common.active")}
            </Select.Option>

            <Select.Option key={"INACTIVE"} value={false}>
              {t("common.inactive")}
            </Select.Option>
          </Select>
        </Col>

        <Col md={5} className="flex justify-end">
          <AddProductButton
            buttonProps={{ text: t("sales.product"), className: "ml-1" }}
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
            title: t("navigation.products"),
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
                    <span className="text-xs">
                      {t("products.barcode")}: {product.barcode}
                    </span>
                    <span className="text-xs">
                      {t("products.sku")}: {product.sku}
                    </span>
                  </div>
                </div>
              );
            },
          },
          {
            title: t("common.quantity"),
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
            render: (quantity: number, _, index: number) => {
              return (
                <div className="flex flex-col items-center">
                  <span className={quantity <= 0 ? "text-red-600" : ""}>
                    {t("common.quantity")}: {quantity}
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
            title: t("common.price"),
            dataIndex: "price",
            key: "price",
            align: "center",
            render: (price: number, _, index: number) => {
              return (
                <div className="flex flex-col justify-center items-center">
                  <span>
                    {t("common.price")}: R${price}
                  </span>

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
        ]}
        expandable={{
          showExpandColumn: false,
          expandedRowKeys,
          expandedRowRender: (product: IProduct) => (
            <div className="flex justify-end flex-wrap gap-2 py-0 px-2">
              {product.storeIds.map((storeId: string) => {
                const store: IStore | undefined = getStore(storeId);

                const isSelectedStore: boolean = includes(
                  selectedStoreIds,
                  store?._id,
                );

                if (!store || !isSelectedStore) {
                  return null;
                }

                return (
                  <Tooltip
                    key={storeId}
                    title={`${t("sales.addProductByStore")} "${store.name}"`}
                  >
                    <Button
                      size="middle"
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
              })}
            </div>
          ),
          rowExpandable: () => true,
        }}
        search={{ placeholder: t("products.searchProducts") }}
        loading={isLoading || isLoadingCategories || isLoadingTags}
        total={total}
        className="overflow-auto"
      />

      <SelectProductItemModal
        product={selectedProduct}
        productItems={productItems}
        isOpen={isSelectProductItemModalOpen}
        onClose={() => {
          setIsSelectProductItemModalOpen(false);
          setSelectedProduct(null);
          setProductItems([]);
          setPendingStoreId(null);
        }}
        onSelectProductItem={handleSelectProductItem}
      />
    </div>
  );
};
