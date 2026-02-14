"use client";

import { Button, Card, Table, Tag, Tooltip } from "antd";
import moment from "moment";
import { useRouter } from "next/navigation";

import { EditOutlined, EnterOutlined, PlusOutlined } from "@ant-design/icons";

import { IProductItem } from "../../../../shared/business/product-items/product-items.interface";
import Urls from "../../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../../shared/utils/dates/dates.enum";
import { formatterMoney } from "../../../../shared/utils/strings/string";
import { useFindProductItemsByProduct } from "../../useFindProductItemsByProduct";

interface Props {
  productId: string;
}

export const ProductItemsList: React.FC<Props> = ({ productId }) => {
  const router = useRouter();
  const { productItems, isLoading, refetch } =
    useFindProductItemsByProduct(productId);

  return (
    <Card
      title={`Product Items (${productItems.length})`}
      className="mt-5"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push(Urls.NEW_PRODUCT_ITEM)}
          size="small"
        >
          Add Item
        </Button>
      }
    >
      <Table<IProductItem>
        dataSource={productItems}
        loading={isLoading}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        columns={[
          {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (name: string, item: IProductItem) => (
              <div className="flex flex-col">
                <span>{name}</span>
                {item.brand && (
                  <span className="text-xs text-gray-500 italic">
                    {item.brand}
                  </span>
                )}
              </div>
            ),
          },
          {
            title: "Barcode",
            dataIndex: "barcode",
            key: "barcode",
            render: (barcode: string) => barcode || "-",
          },
          {
            title: "SKU",
            dataIndex: "sku",
            key: "sku",
            render: (sku: string) => sku || "-",
          },
          {
            title: "Price",
            dataIndex: "price",
            key: "price",
            align: "right",
            render: (price: number) => formatterMoney(price),
          },
          {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
            render: (quantity: number) => (
              <Tag color={quantity <= 0 ? "red" : "green"}>{quantity}</Tag>
            ),
          },
          {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (createdAt: Date) =>
              moment(createdAt).format(DatesEnum.Format.DDMMYYY),
          },
          {
            title: "Actions",
            key: "actions",
            align: "center",
            fixed: "right",
            render: (_: any, item: IProductItem) => (
              <Button.Group size="small">
                <Tooltip title="View">
                  <Button
                    icon={<EnterOutlined />}
                    onClick={() =>
                      router.push(
                        Urls.PRODUCT_ITEM.replace(":productItemId", item._id)
                      )
                    }
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() =>
                      router.push(
                        Urls.EDIT_PRODUCT_ITEM.replace(
                          ":productItemId",
                          item._id
                        )
                      )
                    }
                  />
                </Tooltip>
              </Button.Group>
            ),
          },
        ]}
      />
    </Card>
  );
};
