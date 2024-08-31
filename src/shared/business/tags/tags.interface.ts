import { ICreatedAtEntity } from "../interfaces/created-at.interface";
import { IUpdatedAtEntity } from "../interfaces/updated-at.interface";
import TagsEnum from "./tags.enum";

export interface ITag extends ICreatedAtEntity, IUpdatedAtEntity {
  readonly _id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  type: TagsEnum.Type;
}
