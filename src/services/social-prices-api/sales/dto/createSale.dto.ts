import SalesEnum from "../../../../shared/business/sales/sales.enum";
import { CreateAddressDto } from "../../../../shared/business/shared/dtos/CreateAddress.dto";
import { CreatePhoneNumberDto } from "../../../../shared/business/shared/dtos/CreatePhoneNumber.dto";
import UsersEnum from "../../../../shared/business/users/users.enum";

export class SaleStoreProductDto {
  productId: string = "";
  price: number = 0;
  quantity: number = 0;
  barCode: string = "";
  note: string | null = null;
}

export class SaleTotalsDiscountDto {
  normal: number = 0;
}

export class SalePaymentDto {
  type: SalesEnum.PaymentType = SalesEnum.PaymentType.CASH;
  status: SalesEnum.PaymentStatus = SalesEnum.PaymentStatus.PENDING;
  amount: number = 0;
  provider: any | null = null;
}

export class SaleTotalsDto {
  subtotalAmount: number = 0;
  discount: SaleTotalsDiscountDto | null = null;
  taxAmount: number | null = null;
  shippingAmount: number | null = null;
  totalFinalAmount: number = 0;
}

export class SaleHeaderBillingDto {
  address: CreateAddressDto | null = null;
}

export class SaleHeaderShippingDto {
  address: CreateAddressDto | null = null;
}

export class SaleHeaderDto {
  billing: SaleHeaderBillingDto | null = null;
  shipping: SaleHeaderShippingDto | null = null;
  deliveryType: SalesEnum.DeliveryType = SalesEnum.DeliveryType.PICKUP;
}

export class SaleBuyerDto {
  userId: string | null = null;
  email: string = "";
  name: string = "";
  birthDate: Date | null = null;
  gender: UsersEnum.Gender | null = null;
  phoneNumber: CreatePhoneNumberDto | null = null;
  address: CreateAddressDto | null = null;
}

export class SaleStoreDto {
  storeId: string = "";
  customerId: string | null = null;
  products: SaleStoreProductDto[] = [];
  totals: SaleTotalsDto = {} as any;
}

export default class CreateSaleDto {
  createdByUserId: string = "";
  buyer: SaleBuyerDto | null = null;
  type: SalesEnum.Type = SalesEnum.Type.MANUAL;
  totals: SaleTotalsDto = {} as any;
  header: SaleHeaderDto | null = null;
  note: string | null = null;
  status: SalesEnum.Status = SalesEnum.Status.STARTED;
  payments: SalePaymentDto[] = [];
  stores: SaleStoreDto[] = [];
  isCreateQuote: boolean = false;
  paymentStatus: SalesEnum.PaymentStatus = SalesEnum.PaymentStatus.PENDING;
}
