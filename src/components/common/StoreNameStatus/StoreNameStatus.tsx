import { Badge } from "antd";

import StoresEnum from "../../../shared/business/stores/stores.enum";
import { IStore } from "../../../shared/business/stores/stores.interface";

interface Props {
  store: IStore;
}

export const StoreNameStatus: React.FC<Props> = ({ store }) => {
  return (
    <>
      <span className="mr-1">{store.name ?? "No name"}</span>
      <Badge
        color={StoresEnum.StatusBadgeColor[store.status as StoresEnum.Status]}
      />
    </>
  );
};
