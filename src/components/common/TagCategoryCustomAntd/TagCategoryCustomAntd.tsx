import { Tag, Tooltip } from "antd";

import { PlusCircleOutlined } from "@ant-design/icons";

import { ICategory } from "../../../shared/business/categories/categories.interface";

interface Props {
  category: ICategory;
  useTag?: boolean;
}
export const TagCategoryCustomAntd: React.FC<Props> = ({
  category,
  useTag = true,
}) => {
  if (useTag) {
    return (
      <Tooltip title={category.description}>
        <Tag icon={category.ownerUserId ? <PlusCircleOutlined /> : null}>
          {category.name}
        </Tag>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={category.description}>
      {category.ownerUserId && (
        <PlusCircleOutlined style={{ marginRight: 5 }} />
      )}
      {category.name}
    </Tooltip>
  );
};
