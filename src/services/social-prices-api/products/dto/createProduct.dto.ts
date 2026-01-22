export class ProductDimensionsDto {
  size: string | null = null;
  height: number | null = null;
  width: number | null = null;
  length: number | null = null;
  depth: number | null = null;
  diameter: number | null = null;
  thickness: number | null = null;
  volume: number | null = null;
  weight: number | null = null;
}
export default class CreateProductDto {
  name: string = "";
  barcode: string | null = null;
  details: string | null = null;
  quantity: number = 0;
  description: string | null = null;
  price: number = 0;
  isActive: boolean = false;
  storeIds: string[] = [];
  QRCode: string | null = null;
  categoriesIds: string[] = [];
  tagsIds: string[] = [];
  brand: string | null = null;
  releaseDate: Date | null = null;
  dimensions: ProductDimensionsDto | null = null;
  colors: string[] = [];
}
