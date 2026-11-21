/**
 * What the owner informs to price a product. It is informational: the sale
 * price stays in `price` and is only changed when the owner chooses to.
 */
export interface IPricing {
  cost: number | null;
  variableExpensesPercentage: number | null;
  fixedExpensesPercentage: number | null;
  profitPercentage: number | null;
}

export interface IPricingResult {
  /** Variable + fixed expenses + profit, as a percentage of the sale price. */
  totalPercentage: number;
  /** True when the percentages leave nothing of the price to cover the cost. */
  isOverLimit: boolean;
  /** Null when there is no cost or the percentages are over the limit. */
  suggestedPrice: number | null;
  /** What is left of the current price after cost and expenses. */
  currentProfit: number | null;
  currentMarginPercentage: number | null;
}
