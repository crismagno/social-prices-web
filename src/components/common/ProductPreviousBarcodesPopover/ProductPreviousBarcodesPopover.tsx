import {
  Popover,
  Tag,
} from 'antd';

import { QuestionCircleTwoTone } from '@ant-design/icons';

import {
  IProductItem,
} from '../../../shared/business/product-items/product-items.interface';
import { IProduct } from '../../../shared/business/products/products.interface';

interface Props {
  product: IProduct | IProductItem;
}

export const ProductPreviousBarcodesPopover: React.FC<Props> = ({
  product,
}) => {
  return (
    product.previousBarcodes.length > 0 && (
      <Popover
        content={
          <ul>
            {product.previousBarcodes.map(
              (previousBarcode: string, index: number) => (
                <li key={`previousBarcode_${index}`} className="mt-1">
                  <Tag>{previousBarcode}</Tag>
                </li>
              )
            )}
          </ul>
        }
        title="Previous Barcodes"
      >
        <QuestionCircleTwoTone className="ml-1" />
      </Popover>
    )
  );
};
