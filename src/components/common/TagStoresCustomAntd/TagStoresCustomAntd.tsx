import { IStore } from "../../../shared/business/stores/stores.interface";
import { TagStoreCustomAntd } from "../TagStoreCustomAntd/TagStoreCustomAntd";

interface Props {
  stores: IStore[];
  storeIds: string[];
  useTag?: boolean;
}

export const TagStoresCustomAntd: React.FC<Props> = ({
  stores,
  storeIds,
  useTag = true,
}) => {
  return storeIds.map((storeId: string) => {
    const store: IStore | undefined = stores.find(
      (store: IStore) => store._id === storeId
    );

    if (!store) {
      return null;
    }

    return <TagStoreCustomAntd key={store._id} store={store} useTag={useTag} />;
  });
};
