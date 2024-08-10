import { ITag } from "../../../shared/business/tags/tags.interface";
import { TagTagCustomAntd } from "../TagTagCustomAntd/TagTagCustomAntd";

interface Props {
  tags: ITag[];
  tagsIds: string[];
  useTag?: boolean;
}

export const TagTagsCustomAntd: React.FC<Props> = ({
  tags,
  tagsIds,
  useTag = true,
}) => {
  return tagsIds.map((tagId: string) => {
    const tag: ITag | undefined = tags.find((tag: ITag) => tag._id === tagId);

    if (!tag) {
      return null;
    }

    return <TagTagCustomAntd key={tag._id} tag={tag} useTag={useTag} />;
  });
};
