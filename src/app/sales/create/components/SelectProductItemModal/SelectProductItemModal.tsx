import { useEffect, useState } from "react";

import { Button, Image, Modal, Radio, Space, Tag } from "antd";
import { find } from "lodash";

import { CheckCircleOutlined } from "@ant-design/icons";

import { IProductItem } from "../../../../../shared/business/product-items/product-items.interface";
import { IProduct } from "../../../../../shared/business/products/products.interface";
import { getImageUrl } from "../../../../../shared/utils/images/images-url";
import ImagesEnum from "../../../../../shared/utils/images/images.enum";
import { formatterMoney } from "../../../../../shared/utils/strings/string";

interface Props {
  product: IProduct | null;
  productItems: IProductItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProductItem: (productItem: IProductItem) => void;
}

export const SelectProductItemModal: React.FC<Props> = ({
  product,
  productItems,
  isOpen,
  onClose,
  onSelectProductItem,
}) => {
  const [selectedProductItemId, setSelectedProductItemId] = useState<
    string | null
  >(null);

  useEffect(() => {
    // Auto-select default product item if available
    const defaultProductItem = find(productItems, { isDefault: true });
    if (defaultProductItem) {
      setSelectedProductItemId(defaultProductItem._id);
    } else if (productItems.length > 0) {
      setSelectedProductItemId(productItems[0]._id);
    }
  }, [productItems]);

  const handleConfirm = () => {
    const selectedProductItem = productItems.find(
      (item) => item._id === selectedProductItemId
    );

    if (selectedProductItem) {
      onSelectProductItem(selectedProductItem);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedProductItemId(null);
    onClose();
  };

  return (
    <Modal
      title={
        <div>
          <span className="mr-2">Select Product Item</span>
          {product && (
            <span className="text-sm text-gray-500">({product.name})</span>
          )}
        </div>
      }
      open={isOpen}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          disabled={!selectedProductItemId}
          icon={<CheckCircleOutlined />}
        >
          Confirm
        </Button>,
      ]}
      width={700}
    >
      <div className="mb-4">
        <p className="text-gray-600">
          This product has multiple items. Please select one to add to the sale:
        </p>
      </div>

      <Radio.Group
        value={selectedProductItemId}
        onChange={(e) => setSelectedProductItemId(e.target.value)}
        className="w-full"
      >
        <Space direction="vertical" className="w-full">
          {productItems.map((productItem) => (
            <Radio
              key={productItem._id}
              value={productItem._id}
              className="w-full"
            >
              <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 w-full">
                <div className="flex items-center flex-1">
                  <Image
                    width={60}
                    height={60}
                    src={
                      productItem.mainUrl
                        ? getImageUrl(productItem.mainUrl)
                        : ImagesEnum.FilesNames.DefaultAvatarImage
                    }
                    alt={productItem.name}
                    className="rounded"
                  />

                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <span className="font-semibold text-base">
                        {productItem.name}
                      </span>
                      {productItem.isDefault && (
                        <Tag color="blue" className="ml-2">
                          Default
                        </Tag>
                      )}
                      {!productItem.isActive && (
                        <Tag color="red" className="ml-2">
                          Inactive
                        </Tag>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      {productItem.barcode && (
                        <span className="mr-3">
                          <strong>Barcode:</strong> {productItem.barcode}
                        </span>
                      )}
                      {productItem.sku && (
                        <span className="mr-3">
                          <strong>SKU:</strong> {productItem.sku}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <span className="mr-3">
                        <strong>Quantity:</strong>{" "}
                        <span
                          className={
                            productItem.quantity <= 0 ? "text-red-600" : ""
                          }
                        >
                          {productItem.quantity}
                        </span>
                      </span>
                      <span className="mr-3">
                        <strong>Price:</strong>{" "}
                        {formatterMoney(productItem.price)}
                      </span>
                    </div>

                    {productItem.brand && (
                      <div className="text-sm text-gray-500 mt-1">
                        <strong>Brand:</strong> {productItem.brand}
                      </div>
                    )}

                    {productItem.colors && productItem.colors.length > 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        <strong>Colors:</strong> {productItem.colors.join(", ")}
                      </div>
                    )}

                    {productItem.dimensions?.size && (
                      <div className="text-sm text-gray-500 mt-1">
                        <strong>Size:</strong> {productItem.dimensions.size}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </Modal>
  );
};
