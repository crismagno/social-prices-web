import CreateProductItemDto from "./createProductItem.dto";

export default class UpdateProductItemDto extends CreateProductItemDto {
  productItemId: string = "";
  deletedFilesUrl: string[] = [];
}
