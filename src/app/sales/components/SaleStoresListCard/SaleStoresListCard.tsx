"use client";

import React from "react";

import { Card } from "antd";
import { find } from "lodash";

import { ShopOutlined } from "@ant-design/icons";

import { TagStoreCustomAntd } from "../../../../components/common/TagStoreCustomAntd/TagStoreCustomAntd";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import {
  ISale,
  ISaleStore,
} from "../../../../shared/business/sales/sale.interface";
import { IStore } from "../../../../shared/business/stores/stores.interface";

interface Props {
  sale: ISale | null;
  stores: IStore[];
}

export const SaleStoresListCard: React.FC<Props> = ({ sale, stores }) => {
  const { t } = useLanguageData();

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <ShopOutlined className="text-slate-500" />
          <span className="font-semibold">{t("sales.storesCard")}</span>
        </div>
      }
      className="flex-1 border-l-4 border-l-slate-500"
    >
      {sale?.stores?.map((saleStore: ISaleStore) => {
        const storeId: string =
          typeof saleStore.storeId === "object"
            ? saleStore.store!._id!
            : saleStore.storeId;
        const store: IStore | undefined = find(stores, { _id: storeId });

        return store ? (
          <TagStoreCustomAntd
            key={`sale-store-list-${saleStore.storeId}`}
            store={store}
          />
        ) : null;
      })}
    </Card>
  );
};
