"use client";
import { memo } from "react";

import { ISale } from "../../../../shared/business/sales/sale.interface";
import useLanguageData from "../../../../data/context/language/useLanguageData";
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
  const { t } = useLanguageData();

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

  return <small className="text-red-500 italic ml-2">{t("sales.incorrectPayment")}</small>;
};

export default memo(SalesMissingPaymentLabel);
