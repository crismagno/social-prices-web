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
}
