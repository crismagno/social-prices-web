"use client";

import React from "react";

import { Card } from "antd";
import { find } from "lodash";

import { TagStoreCustomAntd } from "../../../../components/common/TagStoreCustomAntd/TagStoreCustomAntd";
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
  return (
    <Card title="Stores">
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
