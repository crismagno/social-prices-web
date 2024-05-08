import CreateProductDto from './createProduct.dto';

export default class UpdateProductDto extends CreateProductDto {
  productId: string = "";
  deletedFilesUrl: string[] = [];
}
