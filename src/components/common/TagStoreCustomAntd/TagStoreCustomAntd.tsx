import { Tag, Tooltip } from "antd";

import { IStore } from "../../../shared/business/stores/stores.interface";
import { StoreNameStatus } from "../StoreNameStatus/StoreNameStatus";

interface Props {
  store: IStore;
  useTag?: boolean;
}
export const TagStoreCustomAntd: React.FC<Props> = ({
  store,
  useTag = true,
}) => {
  if (useTag) {
    return (
      <Tooltip title={store.description}>
        <Tag>
          <StoreNameStatus store={store} />
        </Tag>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={store.description}>
      <StoreNameStatus store={store} />
    </Tooltip>
  );
};
