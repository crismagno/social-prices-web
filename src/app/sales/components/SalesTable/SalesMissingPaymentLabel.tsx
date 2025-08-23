"use client";
import { memo } from "react";

import { ISale } from "../../../../shared/business/sales/sale.interface";
import { getTotalPayment } from "../../../../shared/business/sales/sales.utils";

export interface Props {
  sale: ISale;
}

const SalesMissingPaymentLabel: React.FC<Props> = ({ sale }) => {
  const totalAfterPayment: number =
    sale.totals.totalFinalAmount - getTotalPayment(sale);

  if (totalAfterPayment === 0) {
    return null;
  }

  return <small className="text-red-500 italic">Incorrect Payment</small>;
};

export default memo(SalesMissingPaymentLabel);
