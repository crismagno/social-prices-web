import React from 'react';

import {
  Card,
  Divider,
  Tooltip,
} from 'antd';
import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

import { ShoppingCartOutlined } from '@ant-design/icons';

import {
  AvatarDescription,
} from '../../../../components/common/AvatarDescription/AvatarDescription';
import {
  IProductItem,
} from '../../../../shared/business/product-items/product-items.interface';
import {
  IProduct,
} from '../../../../shared/business/products/products.interface';
import {
  IGetSalesBalanceTotalsResponse,
  IGetSalesProductBalanceResponse,
} from '../../../../shared/business/sales/sales.type';
import Urls from '../../../../shared/common/routes-app/routes-app';
import { formatToMoneyDecimal } from '../../../../shared/utils/strings/string';
import useLanguageData from '../../../../data/context/language/useLanguageData';

interface Props {
  className?: string;
  title?: string;
  salesBalanceTotals?: IGetSalesBalanceTotalsResponse;
  storeId?: string;
  customerId?: string;
}

export const SalesBalanceStatistic: React.FC<Props> = ({
  className,
  title,
  salesBalanceTotals = {
    quantity: 0,
    total: 0,
    productsBalance: [],
    salesQuantity: 0,
  },
  storeId,
  customerId,
}) => {
  const router: AppRouterInstance = useRouter();
  const { t } = useLanguageData();

  const productBalance: IGetSalesProductBalanceResponse | undefined =
    salesBalanceTotals?.productsBalance?.[0];

  const renderProductsBalance = () => {
    if (salesBalanceTotals.productsBalance?.length) {
      return (
        <>
          {salesBalanceTotals.productsBalance.map(
            (
              productBalance: IGetSalesProductBalanceResponse,
              index: number
            ) => {
              const productId: string = productBalance.product?._id!;
              const productItemId: string = productBalance.productItem?._id!;

              const mainUrl: string | undefined | null =
                productBalance.productItem?.mainUrl ??
                productBalance.product?.mainUrl;
              const name: string | undefined =
                productBalance.productItem?.name ??
                productBalance.product?.name;

              return (
                <AvatarDescription
                  key={index}
                  src={mainUrl}
                  buttonIcon={<ShoppingCartOutlined />}
                  buttonTooltip={t('sales.createSaleByProduct')}
                  onClickButton={() => {
                    if (storeId) {
                      router.push(
                        Urls.SALES_CREATE_BY_PRODUCT_AND_STORE.replace(
                          ":productId",
                          productId
                        ).replace(":storeId", storeId)
                      );
                    } else if (customerId) {
                      router.push(
                        Urls.SALES_CREATE_BY_PRODUCT_AND_CUSTOMER.replace(
                          ":productId",
                          productId
                        ).replace(":customerId", customerId)
                      );
                    } else if (productItemId) {
                      router.push(
                        Urls.SALES_CREATE_BY_PRODUCT_ITEM.replace(
                          ":productItemId",
                          productItemId
                        )
                      );
                    } else {
                      router.push(
                        Urls.SALES_CREATE_BY_PRODUCT.replace(
                          ":productId",
                          productId
                        )
                      );
                    }
                  }}
                  onClickTitleButton={() => {
                    if (productItemId) {
                      router.push(
                        Urls.PRODUCT_ITEM.replace(
                          ":productItemId",
                          productItemId
                        )
                      );
                    } else {
                      router.push(
                        Urls.PRODUCT.replace(":productId", productId)
                      );
                    }
                  }}
                  title={name}
                  subtitle={`Total: ${formatToMoneyDecimal(
                    productBalance?.total
                  )} | Qty: ${productBalance?.quantity}`}
                  className={index > 0 ? "ml-2" : ""}
                />
              );
            }
          )}
        </>
      );
    }

    const product: IProduct | undefined = productBalance?.product;
    const productItem: IProductItem | undefined = productBalance?.productItem;

    const mainUrl: string | undefined | null =
      productItem?.mainUrl ?? product?.mainUrl;
    const name: string | undefined = productItem?.name ?? product?.name;

    return (
      <AvatarDescription
        src={mainUrl}
        buttonIcon={<ShoppingCartOutlined />}
        buttonTooltip={t('sales.createSaleByProduct')}
        onClickButton={
          productItem || product
            ? () =>
                router.push(
                  productItem
                    ? Urls.SALES_CREATE_BY_PRODUCT_ITEM.replace(
                        ":productItemId",
                        productItem._id!
                      )
                    : Urls.SALES_CREATE_BY_PRODUCT.replace(
                        ":productId",
                        product?._id!
                      )
                )
            : undefined
        }
        styleLeft={{ width: product || productItem ? 282 : 318 }}
        title={name}
        subtitle={`Total: ${formatToMoneyDecimal(
          productBalance?.total
        )} | Qty: ${productBalance?.quantity ?? 0}`}
      />
    );
  };

  return (
    <Card className={`p-1 text-family-1 ${className}`}>
      <div className="flex justify-between items-center">
        {title && <label className="text-lg color-gray-1">{title}</label>}

        <Divider type="vertical" dashed />

        <Tooltip title={t('sales.salesQuantity')}>
          <label className="color-black-1 text-lg">
            {salesBalanceTotals.salesQuantity || 0}
          </label>
        </Tooltip>
      </div>

      <div className="my-2 flex items-center text-family-1">
        <div>
          <label className="color-black-1 text-3xl">
            {formatToMoneyDecimal(salesBalanceTotals.total)}
          </label>
        </div>

        <Divider type="vertical" dashed />

        <div>
          <label className="color-black-1">{t('sales.productQty')}: </label>
          <label className="color-black-1 text-lg">
            {salesBalanceTotals.quantity}
          </label>
        </div>
      </div>

      <Divider type="horizontal" className="my-3" />

      <div className="flex w-full overflow-y-hidden pb-2">
        {renderProductsBalance()}
      </div>
    </Card>
  );
};
