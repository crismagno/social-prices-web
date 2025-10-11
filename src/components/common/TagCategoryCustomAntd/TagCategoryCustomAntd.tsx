import { Tag, Tooltip } from "antd";

import { BlockOutlined } from "@ant-design/icons";

import { ICategory } from "../../../shared/business/categories/categories.interface";

interface Props {
  category: ICategory;
  useTag?: boolean;
}
export const TagCategoryCustomAntd: React.FC<Props> = ({
  category,
  useTag = true,
}) => {
  const categoryColor: string = category.color ?? "";

  const icon: JSX.Element = <BlockOutlined style={{ color: categoryColor }} />;

  if (useTag) {
    return (
      <Tooltip title={category.description}>
        <Tag icon={icon}>{category.name}</Tag>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={category.description}>
      {icon}
      {category.name}
    </Tooltip>
  );
};
