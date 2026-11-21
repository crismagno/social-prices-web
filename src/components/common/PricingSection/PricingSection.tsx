"use client";

import React from "react";

import { Alert, Button, Col, Row } from "antd";
import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import z from "zod";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IPricing,
  IPricingResult,
} from "../../../shared/business/shared/pricing/pricing.interface";
import {
  calculatePricing,
  normalizePricing,
} from "../../../shared/business/shared/pricing/pricing.utils";
import {
  formatterMoney,
  formatToMoneyDecimal,
  parserMoney,
} from "../../../shared/utils/strings/string";
import { InputNumberCustomAntd } from "../../custom/antd/InputNumberCustomAntd/InputNumberCustomAntd";
import ContainerTitle from "../ContainerTitle/ContainerTitle";

export const pricingFormSchema = z.object({
  cost: z.any().optional(),
  variableExpensesPercentage: z.any().optional(),
  fixedExpensesPercentage: z.any().optional(),
  profitPercentage: z.any().optional(),
});

export const pricingToFormValues = (pricing?: IPricing | null): IPricing => ({
  cost: pricing?.cost ?? null,
  variableExpensesPercentage: pricing?.variableExpensesPercentage ?? null,
  fixedExpensesPercentage: pricing?.fixedExpensesPercentage ?? null,
  profitPercentage: pricing?.profitPercentage ?? null,
});

interface Props {
  /** The form must have a `pricing` object and a `price` field. */
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  disabled?: boolean;
  className?: string;
}

const PERCENTAGE_FIELDS: { name: keyof IPricing; labelKey: string }[] = [
  { name: "variableExpensesPercentage", labelKey: "pricing.variableExpenses" },
  { name: "fixedExpensesPercentage", labelKey: "pricing.fixedExpenses" },
  { name: "profitPercentage", labelKey: "pricing.profit" },
];

export const PricingSection: React.FC<Props> = ({
  control,
  setValue,
  disabled = false,
  className = "mt-7",
}) => {
  const { t } = useLanguageData()!;

  const [pricingValues, priceValue] = useWatch({
    control,
    name: ["pricing", "price"],
  });

  const pricing: IPricing = normalizePricing(pricingValues);

  const currentPrice: number | null =
    priceValue === null || priceValue === undefined || priceValue === ""
      ? null
      : Number(priceValue);

  const result: IPricingResult = calculatePricing(pricing, currentPrice);

  const isCurrentPriceSuggested: boolean =
    result.suggestedPrice !== null && result.suggestedPrice === currentPrice;

  const handleUseSuggestedPrice = () => {
    setValue("price", result.suggestedPrice, { shouldDirty: true });
  };

  return (
    <ContainerTitle title={t("pricing.title")} className={className}>
      <p className="mt-2 mb-0 text-sm text-gray-500 dark:text-gray-400">
        {t("pricing.description")}
      </p>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <InputNumberCustomAntd
            controller={{ control, name: "pricing.cost" }}
            label={t("pricing.cost")}
            formatter={formatterMoney}
            parser={parserMoney}
            min={0}
            disabled={disabled}
          />
        </Col>

        {PERCENTAGE_FIELDS.map(({ name, labelKey }) => (
          <Col xs={24} sm={12} md={6} key={name}>
            <InputNumberCustomAntd
              controller={{ control, name: `pricing.${name}` }}
              label={t(labelKey)}
              min={0}
              max={100}
              addonAfter="%"
              disabled={disabled}
            />
          </Col>
        ))}
      </Row>

      {result.isOverLimit && (
        <Alert
          className="mt-4"
          type="warning"
          showIcon
          message={t("pricing.overLimit")}
        />
      )}

      {pricing.cost === null ? (
        <p className="mt-4 mb-0 text-sm text-gray-500 dark:text-gray-400">
          {t("pricing.informCost")}
        </p>
      ) : (
        <div
          className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl
            border p-4 border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t("pricing.suggestedPrice")}
            </span>

            <span className="text-2xl font-semibold tabular-nums text-slate-800 dark:text-white">
              {result.suggestedPrice !== null
                ? formatToMoneyDecimal(result.suggestedPrice)
                : "-"}
            </span>
          </div>

          {!disabled && (
            <Button
              onClick={handleUseSuggestedPrice}
              disabled={
                result.suggestedPrice === null || isCurrentPriceSuggested
              }
            >
              {t("pricing.useThisPrice")}
            </Button>
          )}

          {result.currentProfit !== null && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t("pricing.withCurrentPrice")} (
                {formatToMoneyDecimal(currentPrice ?? 0)})
              </span>

              <span
                className={`text-sm font-medium tabular-nums ${
                  result.currentProfit < 0
                    ? "text-red-500"
                    : "text-slate-800 dark:text-white"
                }`}
              >
                {t("pricing.profitAmount")}:{" "}
                {formatToMoneyDecimal(result.currentProfit)} ·{" "}
                {t("pricing.margin")}: {result.currentMarginPercentage}%
              </span>
            </div>
          )}
        </div>
      )}
    </ContainerTitle>
  );
};
