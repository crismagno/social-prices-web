"use client";

import "./styles.scss";

import { useState } from "react";

import { Button, Drawer, Tooltip } from "antd";

import { PlusOutlined } from "@ant-design/icons";

import { IProduct } from "../../../../shared/business/products/products.interface";
import useLanguageData from "../../../../data/context/language/useLanguageData";
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
  const { t } = useLanguageData();

  return (
    <>
      <Tooltip title={t("products.addProductTooltip")}>
        <Button
          icon={buttonProps?.icon || <PlusOutlined />}
          type="primary"
          onClick={() => setOpen(true)}
        >
          {buttonProps?.text}
        </Button>
      </Tooltip>

      <Drawer
        closable={false}
        maskClosable={false}
        open={isOpen}
        title={t("products.addProductDrawerTitle")}
        onClose={() => {
          onCancel?.();
          setOpen(false);
        }}
        footer={null}
        forceRender
        size="large"
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
      </Drawer>
    </>
  );
};
