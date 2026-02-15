import { IProduct } from '../products/products.interface';
import { ICreatedAtEntity } from '../shared/global/created-at.interface';
import { IUpdatedAtEntity } from '../shared/global/updated-at.interface';

export interface IProductItem extends ICreatedAtEntity, IUpdatedAtEntity {
  readonly _id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  isActive: boolean;
  barcode: string | null;
  sku: string | null;
  userId: string;
  productId: string;
  product?: IProduct;
  filesUrl: string[];
  mainUrl: string | null;
  categoriesIds: string[];
  previousBarcodes: string[];
  tagsIds: string[];
  brand: string | null;
  releaseDate: Date | null;
  expirationDate: Date | null;
  dimensions: IProductItemDimensions | null;
  colors: string[] | null;
  isDefault: boolean;
  details: string | null;
  QRCode: string | null;
}

export interface IProductItemDimensions {
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
