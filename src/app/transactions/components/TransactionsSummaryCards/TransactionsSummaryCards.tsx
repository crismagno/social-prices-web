"use client";

import { Card, Col, Row, Statistic } from "antd";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import { ITransactionSummary } from "../../../../shared/business/transactions/transactions.types";
import { formatToMoneyDecimal } from "../../../../shared/utils/strings/string";

interface Props {
  summary: ITransactionSummary | null;
  isLoading: boolean;
}

export const TransactionsSummaryCards: React.FC<Props> = ({
  summary,
  isLoading,
}) => {
  const { t } = useLanguageData();

  const income: number = summary?.totals.income ?? 0;
  const expense: number = summary?.totals.expense ?? 0;
  const balance: number = summary?.totals.balance ?? 0;

  return (
    <Row gutter={[16, 16]} className="mb-4">
      <Col xs={24} md={8}>
        <Card loading={isLoading}>
          <Statistic
            title={t("transactions.totalIncome")}
            value={formatToMoneyDecimal(income)}
            valueStyle={{ color: "#10b981" }}
          />
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card loading={isLoading}>
          <Statistic
            title={t("transactions.totalExpense")}
            value={formatToMoneyDecimal(expense)}
            valueStyle={{ color: "#ef4444" }}
          />
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card loading={isLoading}>
          <Statistic
            title={t("transactions.balance")}
            value={formatToMoneyDecimal(balance)}
            valueStyle={{ color: balance >= 0 ? "#10b981" : "#ef4444" }}
          />
        </Card>
      </Col>
    </Row>
  );
};
