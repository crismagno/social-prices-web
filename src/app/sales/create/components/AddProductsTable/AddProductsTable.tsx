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

import { InputNumberCustomAntd } from "../../../../../components/custom/antd/InputNumberCustomAntd/InputNumberCustomAntd";
import TableCustomAntd2 from "../../../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import CategoriesEnum from "../../../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../../../shared/business/categories/categories.interface";
import { IProduct } from "../../../../../shared/business/products/products.interface";
import { IStore } from "../../../../../shared/business/stores/stores.interface";
import { defaultAvatarImage } from "../../../../../shared/utils/images/files-names";
import { getImageUrl } from "../../../../../shared/utils/images/url-images";
import {
  formatterMoney,
  parserMoney,
} from "../../../../../shared/utils/string-extensions/string-extensions";
import { createTableState } from "../../../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../../../shared/utils/table/table-state.interface";
import { useFindCategoriesByType } from "../../../../categories/useFindCategoriesByType";
import { useFindProductsByUserTableState } from "../../../../products/useFindProductsByUserTableState";

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
  barCode: string;
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

  const [isActive, setIsActive] = useState<Array<boolean | null>>();

  const { control, getValues } = useForm<TFormSchema>({
    values: formValues,
    resolver: zodResolver(formSchema),
  });

  const { isLoading, products, total } =
    useFindProductsByUserTableState(tableStateRequest);

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.PRODUCT);

  useEffect(() => {
    setFormValues({
      products: map(
        products,
        (product: IProduct): TProductFormSchema => ({
          price: product.price,
          productId: product._id,
          quantity: product.quantity,
        })
      ),
    });
  }, [products]);

  useEffect(() => {
    setTableStateRequest({
      ...tableStateRequest,
      filters: { storeIds: selectedStoreIds, categoriesIds, isActive },
    });
  }, [selectedStoreIds, categoriesIds, isActive]);

  const getStore = (storeId: string): IStore | undefined =>
    stores.find((store: IStore) => store._id === storeId);

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
        barCode: product.barCode ?? "",
        fileUrl: product.filesUrl?.[0] ?? null,
        name: product.name,
      },
    });
  };

  return (
    <>
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
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col md={3}>
          <Select
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
            width: 250,
            render: (filesUrl: string[], product: IProduct) => {
              const fileUrl: string = filesUrl?.length
                ? getImageUrl(filesUrl[0])
                : defaultAvatarImage;

              return (
                <div className="flex items-center">
                  <div className="mr-2">
                    <Image
                      key={`${fileUrl}-${Date.now()}`}
                      width={50}
                      src={fileUrl}
                      onError={() => (
                        <Image
                          key={`${fileUrl}-${Date.now()}`}
                          width={50}
                          src={defaultAvatarImage}
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
                    <span className="text-xs">{product.barCode}</span>
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
                  <span>Current: {quantity}</span>

                  <Divider style={{ margin: "7px 0px" }} />

                  <InputNumberCustomAntd
                    divClassName="w-28"
                    min={0}
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
            width: 200,
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
        loading={isLoading || isLoadingCategories}
        pagination={{
          total,
        }}
      />
    </>
  );
};
