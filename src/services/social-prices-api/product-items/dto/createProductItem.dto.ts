export class ProductItemDimensionsDto {
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

export default class CreateProductItemDto {
  name: string = "";
  barcode: string | null = null;
  sku: string | null = null;
  quantity: number = 0;
  description: string | null = null;
  price: number = 0;
  isActive: boolean = true;
  productId: string = "";
  categoriesIds: string[] = [];
  tagsIds: string[] = [];
  brand: string | null = null;
  releaseDate: Date | null = null;
  expirationDate: Date | null = null;
  dimensions: ProductItemDimensionsDto | null = null;
  colors: string[] = [];
  [key: string]: any;
}
