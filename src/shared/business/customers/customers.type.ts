import PersonEnum from "../enums/person.enum";

export interface ICustomerFileUploadTemplateRow {
  rowNumber: number;
  name: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  tags?: string;
  about?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string | number;
  address1?: string;
  address2?: string;
  district?: string;
  addressDescription?: string;
  addressTypes?: string;
  phoneType?: string;
  phoneNumber?: string | number;
  phoneMessengers?: string;
}

export interface IFiltersDownloadCustomers {
  search: string;
  gender: PersonEnum.Gender;
  tagsIds: string[];
  sortField: string;
  sortOrder: string;
}
