"use client";
import { memo } from "react";

import { ISale } from "../../../../shared/business/sales/sale.interface";
import {
  getTotalAfterPayment,
  getTotalPayment,
} from "../../../../shared/business/sales/sales.utils";

export interface Props {
  sale: ISale;
}

const SalesMissingPaymentLabel: React.FC<Props> = ({ sale }) => {
  const totalAfterPayment: number = getTotalAfterPayment(
    sale,
    getTotalPayment(sale)
  );

  if (totalAfterPayment === 0) {
    return null;
  }

  return <small className="text-red-500 italic">Incorrect Payment</small>;
};

export default memo(SalesMissingPaymentLabel);
