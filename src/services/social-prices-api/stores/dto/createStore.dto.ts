import StoresEnum from '../../../../shared/business/stores/stores.enum';

export default class CreateStoreDto {
  name: string = "";
  email: string = "";
  startedAt: Date = new Date();
  description: string | null = null;
  about: string | null = null;
  addresses: any[] = [];
  phoneNumbers: any[] = [];
  status: StoresEnum.Status = StoresEnum.Status.ACTIVE;
  categoriesIds: string[] = [];
}
