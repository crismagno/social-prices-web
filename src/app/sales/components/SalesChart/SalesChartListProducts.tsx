import React, { useState } from 'react';

import {
  Button,
  List,
  Tooltip,
} from 'antd';
import { reduce } from 'lodash';
import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

import { ShoppingCartOutlined } from '@ant-design/icons';

import {
  ImageOrDefault,
} from '../../../../components/common/ImageOrDefault/ImageOrDefault';
import SelectByQuantityOrTotal
  from '../../../../components/common/SelectByQuantityOrTotal/SelectByQuantityOrTotal';
import useLanguageData from '../../../../data/context/language/useLanguageData';
import {
  IGetSalesAnalyticsResponse,
} from '../../../../shared/business/sales/sales.type';
import CommonEnum from '../../../../shared/common/enums/common.enum';
import {
  ITotalQuantity,
} from '../../../../shared/common/interfaces/global.interface';
import Urls from '../../../../shared/common/routes-app/routes-app';
import {
  IChartDataProductItem,
} from '../../../../shared/utils/charts/charts-types';
import ImagesEnum from '../../../../shared/utils/images/images.enum';
import { formatToMoneyDecimal } from '../../../../shared/utils/strings/string';

interface Props {
  salesAnalytics: IGetSalesAnalyticsResponse | null;
}

export const SalesChartListProducts: React.FC<Props> = ({ salesAnalytics }) => {
  const router: AppRouterInstance = useRouter();
  const { t } = useLanguageData();

  const [data, setData] = useState<IChartDataProductItem[]>(
    salesAnalytics?.chartDataProductsByTotal ?? []
  );

  const totalAndQuantityByData: ITotalQuantity = reduce(
    data,
    (acc: ITotalQuantity, curr: IChartDataProductItem) => {
      acc.total += curr.total;
      acc.quantity += curr.quantity;

      return acc;
    },
    {
      total: 0,
      quantity: 0,
    }
  ) || { total: 0, quantity: 0 };

  const totalItem: IChartDataProductItem = {
    name: "Total",
    productId: "",
    quantity: totalAndQuantityByData.quantity,
    total: totalAndQuantityByData.total,
  };

  return (
    <>
      <SelectByQuantityOrTotal
        label={`${t("sales.productsByHighestSalesRevenue")}: `}
        onChange={(quantityOrTotal: CommonEnum.QuantityOrTotal) => {
          setData(
            quantityOrTotal === CommonEnum.QuantityOrTotal.TOTAL
              ? salesAnalytics?.chartDataProductsByTotal ?? []
              : salesAnalytics?.chartDataProductsByQuantity ?? []
          );
        }}
      />

      <List
        dataSource={[...data, totalItem]}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <ImageOrDefault
                  src={item.mainUrl}
                  defaultImage={ImagesEnum.FilesNames.DefaultProductImage}
                />
              }
              title={
                <a href={Urls.PRODUCT.replace(":productId", item.productId)}>
                  {item.name}
                </a>
              }
              description={
                <div className="flex justify-between">
                  <div>
                    {t("common.total")}: {formatToMoneyDecimal(item.total)} |{" "}
                    {t("common.qty")}: {item.quantity}
                  </div>

                  {item.productId && (
                    <Tooltip title={t("sales.createSaleByProduct")}>
                      <Button
                        className="ml-3"
                        type="primary"
                        size="small"
                        onClick={() =>
                          router.push(
                            Urls.SALES_CREATE_BY_PRODUCT.replace(
                              ":productId",
                              item.productId
                            )
                          )
                        }
                        icon={<ShoppingCartOutlined />}
                      />
                    </Tooltip>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </>
  );
};
