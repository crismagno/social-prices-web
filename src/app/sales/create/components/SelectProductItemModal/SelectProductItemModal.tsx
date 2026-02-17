import { useEffect, useState } from "react";

import { Button, Image, Input, Tag, Tooltip } from "antd";

import { CheckCircleOutlined, SearchOutlined } from "@ant-design/icons";

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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredProductItems, setFilteredProductItems] = useState<
    IProductItem[]
  >([]);

  useEffect(() => {
    let items = [...productItems];

    // Sort to always show default product item first
    items.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });

    if (!searchTerm.trim()) {
      setFilteredProductItems(items);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = items.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.barcode?.toLowerCase().includes(searchLower) ||
        item.sku?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredProductItems(filtered);
  }, [searchTerm, productItems]);

  const handleSelectProductItem = (productItem: IProductItem) => {
    onSelectProductItem(productItem);
    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">Select Product Item</h2>
              {product && (
                <span className="text-sm text-gray-500">({product.name})</span>
              )}
            </div>
            <Button onClick={onClose}>Close</Button>
          </div>

          {/* Search */}
          <Input
            placeholder="Search by name, barcode, or SKU..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            size="large"
          />
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {filteredProductItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No product items found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProductItems.map((productItem) => (
                <div
                  key={productItem._id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <Image
                      width={80}
                      height={80}
                      src={
                        productItem.mainUrl
                          ? getImageUrl(productItem.mainUrl)
                          : ImagesEnum.FilesNames.DefaultAvatarImage
                      }
                      alt={productItem.name}
                      className="rounded object-cover"
                    />

                    {/* Content */}
                    <div className="flex-1">
                      {/* Name and Tags */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-base">
                          {productItem.name}
                        </h3>
                        <div className="flex gap-1">
                          {productItem.isDefault && (
                            <Tag color="blue" className="text-xs">
                              Default
                            </Tag>
                          )}
                          {!productItem.isActive && (
                            <Tag color="red" className="text-xs">
                              Inactive
                            </Tag>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-1 text-sm text-gray-600">
                        {productItem.barcode && (
                          <div>
                            <strong>Barcode:</strong> {productItem.barcode}
                          </div>
                        )}
                        {productItem.sku && (
                          <div>
                            <strong>SKU:</strong> {productItem.sku}
                          </div>
                        )}
                        <div className="flex gap-4">
                          <div>
                            <strong>Quantity:</strong>{" "}
                            <span
                              className={
                                productItem.quantity <= 0 ? "text-red-600" : ""
                              }
                            >
                              {productItem.quantity}
                            </span>
                          </div>
                          <div>
                            <strong>Price:</strong>{" "}
                            {formatterMoney(productItem.price)}
                          </div>
                        </div>
                        {productItem.brand && (
                          <div>
                            <strong>Brand:</strong> {productItem.brand}
                          </div>
                        )}
                        {productItem.dimensions?.size && (
                          <div>
                            <strong>Size:</strong> {productItem.dimensions.size}
                          </div>
                        )}
                        {productItem.colors &&
                          productItem.colors.length > 0 && (
                            <div className="flex items-center gap-2">
                              <strong>Colors:</strong>
                              <div className="flex gap-1 flex-wrap">
                                {productItem.colors.map((color, index) => (
                                  <Tooltip key={index} title={color}>
                                    <div
                                      className="w-6 h-6 rounded border border-gray-300"
                                      style={{ backgroundColor: color }}
                                    />
                                  </Tooltip>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Select Button */}
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        className="w-full mt-3"
                        onClick={() => handleSelectProductItem(productItem)}
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
