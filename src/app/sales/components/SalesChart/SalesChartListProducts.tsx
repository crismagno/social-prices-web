import React from "react";

import { List } from "antd";

import { ImageOrDefault } from "../../../../components/common/ImageOrDefault/ImageOrDefault";
import { IChartDataProductItem } from "../../../../shared/utils/charts/charts-types";

interface Props {
  data: IChartDataProductItem[];
}

export const SalesChartListProducts: React.FC<Props> = ({ data }) => {
  return (
    <List
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<ImageOrDefault src={item.mainUrl} />}
            title={<a href="#">{item.name}</a>}
            description={`Total: ${item.total}`}
          />
        </List.Item>
      )}
    />
  );
};
