import { Tag, Tooltip } from "antd";

import { BlockOutlined, QuestionCircleOutlined } from "@ant-design/icons";

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
        <Tag icon={icon}>
          {category.name}

          {category.description && <QuestionCircleOutlined className="ml-1" />}
        </Tag>
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
