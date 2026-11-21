import { IPricing, IPricingResult } from "./pricing.interface";

const MAX_PERCENTAGE: number = 100;

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || `${value}`.trim() === "") {
    return null;
  }

  const parsed: number = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
};

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

/** Form values may come as strings or empty: this gives the shape the API stores. */
export const normalizePricing = (
  pricing?: Partial<Record<keyof IPricing, unknown>> | null,
): IPricing => ({
  cost: toNumber(pricing?.cost),
  variableExpensesPercentage: toNumber(pricing?.variableExpensesPercentage),
  fixedExpensesPercentage: toNumber(pricing?.fixedExpensesPercentage),
  profitPercentage: toNumber(pricing?.profitPercentage),
});

/**
 * Markup over the sale price: expenses and profit are percentages of the price,
 * so the price is the cost divided by what is left of 100%.
 */
export const calculatePricing = (
  pricing: IPricing,
  currentPrice: number | null,
): IPricingResult => {
  const expensesPercentage: number =
    (pricing.variableExpensesPercentage ?? 0) +
    (pricing.fixedExpensesPercentage ?? 0);

  const totalPercentage: number =
    expensesPercentage + (pricing.profitPercentage ?? 0);

  const isOverLimit: boolean = totalPercentage >= MAX_PERCENTAGE;

  const hasCost: boolean = pricing.cost !== null && pricing.cost > 0;

  const suggestedPrice: number | null =
    hasCost && !isOverLimit
      ? roundMoney(pricing.cost! / (1 - totalPercentage / MAX_PERCENTAGE))
      : null;

  const hasCurrentPrice: boolean = !!currentPrice && currentPrice > 0;

  const currentProfit: number | null =
    hasCost && hasCurrentPrice
      ? roundMoney(
          currentPrice! -
            pricing.cost! -
            (currentPrice! * expensesPercentage) / MAX_PERCENTAGE,
        )
      : null;

  return {
    totalPercentage,
    isOverLimit,
    suggestedPrice,
    currentProfit,
    currentMarginPercentage:
      currentProfit !== null
        ? roundMoney((currentProfit / currentPrice!) * MAX_PERCENTAGE)
        : null,
  };
};
