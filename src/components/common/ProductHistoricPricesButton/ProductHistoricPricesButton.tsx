import React, { useState } from "react";

import { Button, Modal, Table, Tooltip } from "antd";
import moment from "moment";

import { UnorderedListOutlined } from "@ant-design/icons";

import { IProduct } from "../../../shared/business/products/products.interface";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { formatterMoney } from "../../../shared/utils/strings/string";

interface Props {
  product: IProduct;
}

export const ProductHistoricPricesButton: React.FC<Props> = ({ product }) => {
  const [open, setOpen] = useState<boolean>(false);

  if (!product.historicPrices.length) {
    return null;
  }

  return (
    <>
      <Tooltip title="See product historic prices">
        <Button
          size="small"
          icon={<UnorderedListOutlined />}
          onClick={() => setOpen(true)}
          style={{}}
        ></Button>
      </Tooltip>

      <Modal
        title={
          <>
            <div>
              Product Historic Prices:{" "}
              <span className="italic text-blue-500">{product.name}</span>
            </div>
          </>
        }
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
        cancelButtonProps={{ hidden: true }}
      >
        <Table
          className="mt-10"
          columns={[
            {
              title: "Barcode",
              dataIndex: "barcode",
            },
            {
              title: "Price",
              dataIndex: "price",
              render: (price: number) => formatterMoney(price),
            },
            {
              title: "Updated At",
              dataIndex: "updatedAt",
              render: (updatedAt: Date) =>
                moment(updatedAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
            },
          ]}
          dataSource={product.historicPrices}
        />
      </Modal>
    </>
  );
};
