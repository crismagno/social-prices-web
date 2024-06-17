import SalesEnum from "../../../../shared/business/sales/sales.enum";
import {
  SaleBuyerDto,
  SaleHeaderDto,
  SalePaymentDto,
  SaleStoreDto,
  SaleTotalsDto,
} from "./createSale.dto";

export default class UpdateSaleDto {
  saleId: string = "";
  updatedByUserId: string = "";
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
