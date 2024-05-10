import { ICreatedAtEntity } from "../interfaces/created-at.interface";
import { IUpdatedAtEntity } from "../interfaces/updated-at.interface";
import CategoriesEnum from "./categories.enum";

export interface ICategory extends ICreatedAtEntity, IUpdatedAtEntity {
  readonly _id: string;
  name: string;
  code: string;
  type: CategoriesEnum.Type;
  createdByUserId: string;
  ownerUserId: string | null;
  description: string | null;
}
