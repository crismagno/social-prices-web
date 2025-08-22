import SalesEnum from "../../../../shared/business/sales/sales.enum";
import { SalePaymentDto } from "./createSale.dto";

export default class UpdateSalePaymentStatusManualDto {
  saleId: string = "";
  newPaymentStatus: SalesEnum.PaymentStatus = SalesEnum.PaymentStatus.PENDING;
  newPayments: SalePaymentDto[] = [];
}
