"use client";

import { Card, Col, Empty, Radio, Row } from "antd";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import {
  ITransactionSummary,
  TTransactionGranularity,
} from "../../../../shared/business/transactions/transactions.types";
import { formatToMoneyDecimal } from "../../../../shared/utils/strings/string";

const INCOME_COLOR: string = "#10b981";
const EXPENSE_COLOR: string = "#ef4444";

const PIE_COLORS: string[] = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#64748b",
];

interface Props {
  summary: ITransactionSummary | null;
  isLoading: boolean;
  granularity: TTransactionGranularity;
  onGranularityChange: (granularity: TTransactionGranularity) => void;
  categoriesById: Record<string, string>;
}

export const TransactionsCharts: React.FC<Props> = ({
  summary,
  isLoading,
  granularity,
  onGranularityChange,
  categoriesById,
}) => {
  const { t } = useLanguageData();

  const pieData = (summary?.expensesByCategory ?? []).map((item) => ({
    name: item.categoryId
      ? (categoriesById[item.categoryId] ?? item.categoryId)
      : t("transactions.uncategorized"),
    value: item.total,
    isUncategorized: !item.categoryId,
  }));

  // "Uncategorized" is always red (it is money spent with no label); the
  // categories take the palette in order, without leaving a gap for it.
  let paletteIndex: number = 0;

  const pieColors: string[] = pieData.map((entry) =>
    entry.isUncategorized
      ? EXPENSE_COLOR
      : PIE_COLORS[paletteIndex++ % PIE_COLORS.length],
  );

  const barData = summary?.byPeriod ?? [];

  return (
    <>
      <Row gutter={[16, 16]} className="mb-2">
        <Col xs={24} lg={10}>
          <Card
            title={t("transactions.expensesByCategory")}
            loading={isLoading}
            className="h-full"
          >
            {pieData.length === 0 ? (
              <Empty description={t("transactions.noData")} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={pieColors[index]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value: number) => formatToMoneyDecimal(value)}
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            title={t("transactions.incomeVsExpenses")}
            loading={isLoading}
            className="h-full"
            extra={
              <Radio.Group
                size="small"
                value={granularity}
                onChange={(event) => onGranularityChange(event.target.value)}
                options={[
                  { value: "day", label: t("transactions.byDay") },
                  { value: "month", label: t("transactions.byMonth") },
                ]}
                optionType="button"
              />
            }
          >
            {barData.length === 0 ? (
              <Empty description={t("transactions.noData")} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis dataKey="period" />

                  <YAxis />

                  <Tooltip
                    formatter={(value: number) => formatToMoneyDecimal(value)}
                  />

                  <Legend />

                  <Bar
                    dataKey="income"
                    name={t("transactions.typeIncome")}
                    fill={INCOME_COLOR}
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="expense"
                    name={t("transactions.typeExpense")}
                    fill={EXPENSE_COLOR}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      <p className="text-xs italic text-gray-400 mb-4">
        {t("transactions.canceledHint")}
      </p>
    </>
  );
};
