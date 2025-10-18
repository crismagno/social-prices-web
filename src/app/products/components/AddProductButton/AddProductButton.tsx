"use client";

import "./styles.scss";

import { useState } from "react";

import { Button, Modal, Tooltip } from "antd";

import { PlusOutlined } from "@ant-design/icons";

import { IProduct } from "../../../../shared/business/products/products.interface";
import { ProductDetail } from "../ProductDetail/ProductDetail";

interface Props {
  onCancel?: () => void | Promise<void>;
  onCreate: (product: IProduct | null) => void | Promise<void>;
  buttonProps?: {
    text?: any;
    icon?: any;
  };
}

export const AddProductButton: React.FC<Props> = ({
  onCancel,
  onCreate,
  buttonProps,
}) => {
  const [isOpen, setOpen] = useState<boolean>(false);

  return (
    <>
      <Tooltip title="Add new product">
        <Button
          icon={buttonProps?.icon || <PlusOutlined />}
          type="primary"
          onClick={() => setOpen(true)}
        >
          {buttonProps?.text}
        </Button>
      </Tooltip>

      <Modal
        closable={false}
        maskClosable={false}
        open={isOpen}
        title={"Add Product"}
        onCancel={() => {
          onCancel?.();
          setOpen(false);
        }}
        footer={null}
      >
        <ProductDetail
          productId={null}
          onCreate={(product: IProduct | null) => {
            onCreate(product);
            setOpen(false);
          }}
          onCancel={() => {
            onCancel?.();
            setOpen(false);
          }}
        />
      </Modal>
    </>
  );
};
