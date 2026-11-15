"use client";

import { Tag } from "antd";

import useLanguageData from "../../data/context/language/useLanguageData";
import SalesEnum from "../../shared/business/sales/sales.enum";

// The status and payment status of a sale, as the store sees them.
export function SaleStatusTag({ status }: { status: SalesEnum.Status }) {
  const { t } = useLanguageData();

  return (
    <Tag color={(SalesEnum.StatusColors as any)[status]} className="m-0">
      {t(SalesEnum.StatusLabels[status])}
    </Tag>
  );
}

export function SalePaymentStatusTag({
  paymentStatus,
}: {
  paymentStatus: SalesEnum.PaymentStatus;
}) {
  const { t } = useLanguageData();

  return (
    <Tag
      color={(SalesEnum.PaymentStatusColors as any)[paymentStatus]}
      className="m-0"
    >
      {t(SalesEnum.PaymentStatusLabels[paymentStatus])}
    </Tag>
  );
}

// "Loja A, Loja B": where the purchase was made.
export const storesNamesOf = (
  storesNames: Record<string, string | null>,
): string =>
  Object.values(storesNames ?? {})
    .filter(Boolean)
    .join(", ") || "-";
