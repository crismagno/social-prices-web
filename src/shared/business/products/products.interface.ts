import { ICreatedAtEntity } from "../shared/global/created-at.interface";
import { IUpdatedAtEntity } from "../shared/global/updated-at.interface";

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
  barcode: string | null;
  previousBarcodes: string[];
  QRCode: string | null;
  categoriesIds: string[];
  tagsIds: string[];
  uploadFilename: string | null;
  brand: string | null;
  historicPrices: IProductHistoricPrice[];
  releaseDate: Date | null;
  dimensions: IProductDimensions | null;
  colors: string[] | null;
}

export interface IProductHistoricPrice {
  price: number;
  barcode: string;
  updatedAt: Date;
}

export interface IProductDimensions {
  size: string | null;
  height: number | null;
  width: number | null;
  length: number | null;
  depth: number | null;
  diameter: number | null;
  thickness: number | null;
  volume: number | null;
  weight: number | null;
}
