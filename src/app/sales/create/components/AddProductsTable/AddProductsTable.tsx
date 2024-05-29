import { useEffect, useState } from "react";

import { Button, Divider, Empty, Image, Tooltip } from "antd";
import { find, includes, map } from "lodash";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PlusOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import { InputNumberCustomAntd } from "../../../../../components/custom/antd/InputNumberCustomAntd/InputNumberCustomAntd";
import TableCustomAntd2 from "../../../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
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
import { useFindProductsByUserTableState } from "../../../../products/useFindProductsByUserTableState";

const productsFormSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  price: z.number(),
});

type TProductsFormSchema = z.infer<typeof productsFormSchema>;

const formSchema = z.object({
  products: z.array(productsFormSchema),
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

  const { control, watch } = useForm<TFormSchema>({
    values: formValues,
    resolver: zodResolver(formSchema),
  });

  const { isLoading, products, total } =
    useFindProductsByUserTableState(tableStateRequest);

  useEffect(() => {
    setFormValues({
      products: map(
        products,
        (product: IProduct): TProductsFormSchema => ({
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
      filters: { storeIds: selectedStoreIds },
    });
  }, [selectedStoreIds]);

  const getStore = (storeId: string): IStore | undefined =>
    stores.find((store: IStore) => store._id === storeId);

  if (!selectedStoreIds?.length) {
    return <Empty />;
  }

  const handleAddProductToSale = (params: {
    productId: string;
    storeId: string;
    index: number;
  }) => {
    const product: IProduct | undefined = find(products, {
      _id: params.productId,
    });

    onAddProductToSale?.({
      storeId: params.storeId,
      product: {
        price: watch(`products.${params.index}.price`),
        productId: params.productId,
        quantity: watch(`products.${params.index}.quantity`) ?? 1,
        barCode: product?.barCode ?? "",
        fileUrl: product?.filesUrl?.[0] ?? null,
        name: product?.name ?? "",
      },
    });
  };

  return (
    <>
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
            render: (storeIds: string[], product: IProduct, index: number) => {
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
                        handleAddProductToSale({
                          productId: product._id,
                          storeId,
                          index,
                        })
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
        loading={isLoading}
        pagination={{
          total,
        }}
      />
    </>
  );
};
