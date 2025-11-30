import { ICreatedAtEntity } from "../shared/global/created-at.interface";
import { IUpdatedAtEntity } from "../shared/global/updated-at.interface";
import CategoriesEnum from "./categories.enum";

export interface ICategory extends ICreatedAtEntity, IUpdatedAtEntity {
  readonly _id: string;
  name: string;
  code: string;
  type: CategoriesEnum.Type;
  createdByUserId: string;
  ownerUserId: string | null;
  description: string | null;
  color: string | null;
}
