"use client";

import React from "react";

import { Descriptions } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IPricing,
  IPricingResult,
} from "../../../shared/business/shared/pricing/pricing.interface";
import {
  calculatePricing,
  normalizePricing,
} from "../../../shared/business/shared/pricing/pricing.utils";
import { formatToMoneyDecimal } from "../../../shared/utils/strings/string";

interface Props {
  pricing?: IPricing | null;
  /** The current sale price, to show what it leaves as profit. */
  price: number | null;
}

const formatPercentage = (value: number | null): string =>
  value === null ? "-" : `${value}%`;

/** Read-only pricing, for the product and product item profiles. */
export const PricingView: React.FC<Props> = ({ pricing, price }) => {
  const { t } = useLanguageData()!;

  const values: IPricing = normalizePricing(pricing);

  const result: IPricingResult = calculatePricing(values, price);

  return (
    <Descriptions
      bordered
      column={{ xs: 1, sm: 2, md: 2, lg: 4, xl: 4 }}
      size="small"
      title={t("pricing.title")}
    >
      <Descriptions.Item label={t("pricing.cost")}>
        {values.cost === null ? "-" : formatToMoneyDecimal(values.cost)}
      </Descriptions.Item>

      <Descriptions.Item label={t("pricing.variableExpenses")}>
        {formatPercentage(values.variableExpensesPercentage)}
      </Descriptions.Item>

      <Descriptions.Item label={t("pricing.fixedExpenses")}>
        {formatPercentage(values.fixedExpensesPercentage)}
      </Descriptions.Item>

      <Descriptions.Item label={t("pricing.profit")}>
        {formatPercentage(values.profitPercentage)}
      </Descriptions.Item>

      <Descriptions.Item label={t("pricing.suggestedPrice")}>
        <span className="font-semibold">
          {result.suggestedPrice === null
            ? "-"
            : formatToMoneyDecimal(result.suggestedPrice)}
        </span>
      </Descriptions.Item>

      <Descriptions.Item label={t("pricing.currentProfit")}>
        <span
          className={`font-semibold ${
            (result.currentProfit ?? 0) < 0 ? "text-red-500" : "text-green-600"
          }`}
        >
          {result.currentProfit === null
            ? "-"
            : formatToMoneyDecimal(result.currentProfit)}
        </span>
      </Descriptions.Item>

      <Descriptions.Item label={t("pricing.currentMargin")}>
        {formatPercentage(result.currentMarginPercentage)}
      </Descriptions.Item>
    </Descriptions>
  );
};
