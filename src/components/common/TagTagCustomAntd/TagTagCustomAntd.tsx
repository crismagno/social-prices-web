import { Tag, Tooltip } from "antd";

import { TagFilled } from "@ant-design/icons";

import { ITag } from "../../../shared/business/tags/tags.interface";

interface Props {
  tag: ITag;
  useTag?: boolean;
}
export const TagTagCustomAntd: React.FC<Props> = ({ tag, useTag = true }) => {
  if (useTag) {
    return (
      <Tooltip title={tag.description}>
        <Tag icon={<TagFilled style={{ color: tag.color ?? "" }} />}>
          {tag.name}
        </Tag>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tag.description}>
      <TagFilled style={{ marginRight: 5, color: tag.color ?? "" }} />
      {tag.name}
    </Tooltip>
  );
};
