"use client";
import { memo } from "react";

import { ISale } from "../../../../shared/business/sales/sale.interface";
import {
  getTotalAfterPayment,
  getTotalPayment,
} from "../../../../shared/business/sales/sales.utils";

export interface Props {
  sale?: ISale;
  totalAfterPayment?: number;
}

const SalesMissingPaymentLabel: React.FC<Props> = ({
  sale,
  totalAfterPayment,
}) => {
  if (totalAfterPayment === undefined && !sale) {
    return null;
  }

  const calculatedTotalAfterPayment: number =
    totalAfterPayment !== undefined
      ? totalAfterPayment
      : sale
      ? getTotalAfterPayment(sale, getTotalPayment(sale))
      : 0;

  if (calculatedTotalAfterPayment === 0) {
    return null;
  }

  return <small className="text-red-500 italic ml-2">Incorrect Payment</small>;
};

export default memo(SalesMissingPaymentLabel);
