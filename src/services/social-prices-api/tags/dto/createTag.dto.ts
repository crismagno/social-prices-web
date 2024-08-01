import TagsEnum from "../../../../shared/business/tags/tags.enum";

export default class CreateTagDto {
  userId: string = "";
  name: string = "";
  description: string | null = null;
  type: TagsEnum.Type = TagsEnum.Type.ANY;
  color: string | null = null;
}
