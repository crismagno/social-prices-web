import { Card } from "antd";

import { IStore } from "../../../../../shared/business/stores/stores.interface";

interface Props {
  stores: IStore[];
}

export const SelectedProductsList: React.FC<Props> = ({ stores }) => {
  const getStore = (storeId: string): IStore | undefined =>
    stores.find((store) => store._id === storeId);

  return <Card title="Selected Products"></Card>;
};
