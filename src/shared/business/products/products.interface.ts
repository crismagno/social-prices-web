import { ICreatedAtEntity } from "../interfaces/created-at.interface";
import { IUpdatedAtEntity } from "../interfaces/updated-at.interface";

export interface IProduct extends ICreatedAtEntity, IUpdatedAtEntity {
  readonly _id: string;
  name: string;
  quantity: number;
  description: string | null;
  details: string | null;
  price: number;
  isActive: boolean;
  userId: string;
  storeIds: string[];
  filesUrl: string[];
  mainUrl: string | null;
  barCode: string | null;
  QRCode: string | null;
  categoriesCode: string[];
}
