import { useState } from "react";

import { Modal, Tooltip } from "antd";
import TextArea from "antd/es/input/TextArea";

import { CommentOutlined } from "@ant-design/icons";

import ButtonCommon from "../../../../components/common/ButtonCommon/ButtonCommon";
import { ISaleStoreProduct } from "../../../../shared/business/sales/sale.interface";

interface Props {
  saleStoreProduct: ISaleStoreProduct;
}

export const SelectedProductNoteButton: React.FC<Props> = ({
  saleStoreProduct,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  return (
    <>
      <Tooltip title="See note product">
        <ButtonCommon
          onClick={() => setIsVisible(true)}
          color="transparent"
          className="rounded-r-full rounded-l-full shadow-none"
        >
          <CommentOutlined style={{ fontSize: 20 }} />
        </ButtonCommon>
      </Tooltip>

      <Modal
        width={600}
        title={
          <div className="flex flex-col">
            <label>Product Note</label>

            <span className="text-sm italic mt-2">
              {saleStoreProduct.product?.name}
              <span className="text-gray-500">
                ({saleStoreProduct.barcode})
              </span>
            </span>
          </div>
        }
        open={isVisible}
        cancelButtonProps={{ hidden: true }}
        onCancel={() => setIsVisible(false)}
        onOk={() => setIsVisible(false)}
      >
        <div>
          <TextArea value={saleStoreProduct.note ?? ""} rows={5} readOnly />
        </div>
      </Modal>
    </>
  );
};
