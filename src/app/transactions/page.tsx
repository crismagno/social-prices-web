"use client";

import { useEffect, useMemo, useState } from "react";

import { App, Button, Card, Popconfirm, Tag, Tooltip } from "antd";
import moment from "moment";
import { useRouter } from "next/navigation";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import useAuthData from "../../data/context/auth/useAuthData";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import CategoriesEnum from "../../shared/business/categories/categories.enum";
import EmployeesEnum from "../../shared/business/employees/employees.enum";
import TagsEnum from "../../shared/business/tags/tags.enum";
import { ITransaction } from "../../shared/business/transactions/transaction.interface";
import TransactionsEnum from "../../shared/business/transactions/transactions.enum";
import {
  ITransactionFilters,
  ITransactionSummaryRequest,
  TTransactionGranularity,
} from "../../shared/business/transactions/transactions.types";
import Urls from "../../shared/common/routes-app/routes-app";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { formatToMoneyDecimal } from "../../shared/utils/strings/string";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { useFindCategoriesByType } from "../categories/useFindCategoriesByType";
import { useFindStoresByUser } from "../stores/useFindStoresByUser";
import { useFindTagsByType } from "../tags/useFindTagsByType";
import { TransactionDetailDrawer } from "./components/TransactionDetailDrawer/TransactionDetailDrawer";
import { TransactionsCharts } from "./components/TransactionsCharts/TransactionsCharts";
import { TransactionsFilters } from "./components/TransactionsFilters/TransactionsFilters";
import { TransactionsSummaryCards } from "./components/TransactionsSummaryCards/TransactionsSummaryCards";
import { useFindTransactionsByUserTableState } from "./useFindTransactionsByUserTableState";
import { useTransactionsSummary } from "./useTransactionsSummary";

export default function TransactionsPage() {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const router = useRouter();

  const { employee } = useAuthData();

  // The API refuses this level too; this only keeps the page out of sight.
  const isForbidden: boolean = employee?.level === EmployeesEnum.Level.EMPLOYEE;

  useEffect(() => {
    if (isForbidden) {
      router.replace(Urls.DASHBOARD);
    }
  }, [isForbidden, router]);

  const { tags } = useFindTagsByType(TagsEnum.Type.TRANSACTION);
  const { categories } = useFindCategoriesByType(
    CategoriesEnum.Type.TRANSACTION,
  );
  const { stores } = useFindStoresByUser();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ITransaction> | undefined
  >(createTableState({ sort: { field: "createdDate", order: "descend" } }));

  const [filters, setFilters] = useState<ITransactionFilters>({});

  const [granularity, setGranularity] =
    useState<TTransactionGranularity>("month");

  const timezone: string = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  // The grid table-state and the summary request are built from the SAME
  // filters and search, so the charts always describe what the grid shows.
  const gridRequest = useMemo(
    () => ({ ...tableStateRequest, filters }),
    [tableStateRequest, filters],
  );

  const summaryRequest: ITransactionSummaryRequest = useMemo(
    () => ({
      search: tableStateRequest?.search,
      filters,
      granularity,
      timezone,
    }),
    [tableStateRequest?.search, filters, granularity, timezone],
  );

  const {
    isLoading: isLoadingGrid,
    transactions,
    total,
    refetch: refetchGrid,
  } = useFindTransactionsByUserTableState(gridRequest);

  const {
    isLoading: isLoadingSummary,
    summary,
    refetch: refetchSummary,
  } = useTransactionsSummary(summaryRequest);

  const [drawer, setDrawer] = useState<{
    isOpen: boolean;
    transaction: ITransaction | null;
  }>({ isOpen: false, transaction: null });

  const categoriesById: Record<string, string> = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [category._id, category.name]),
      ),
    [categories],
  );

  const refreshAll = async (): Promise<void> => {
    await Promise.all([refetchGrid(), refetchSummary()]);
  };

  const handleChangeFilters = (next: ITransactionFilters): void => {
    setFilters(next);

    // A different result set starts again from the first page.
    setTableStateRequest((previous) =>
      previous
        ? {
            ...previous,
            pagination: { ...previous.pagination, current: 1, skip: undefined },
          }
        : previous,
    );
  };

  const handleRemove = async (transaction: ITransaction): Promise<void> => {
    try {
      await serviceMethodsInstance.transactionsServiceMethods.remove(
        transaction._id,
      );

      message.success(t("transactions.removed"));

      await refreshAll();
    } catch (error: any) {
      handleClientError(error);
    }
  };

  if (isForbidden) {
    return null;
  }

  return (
    <Layout
      title={t("transactions.title")}
      subtitle={t("transactions.subtitle")}
      hasBackButton
    >
      <Card
        title={t("transactions.title")}
        className="h-min-80 mt-5"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setDrawer({ isOpen: true, transaction: null })}
          >
            {t("transactions.new")}
          </Button>
        }
      >
        <TransactionsFilters
          filters={filters}
          onChange={handleChangeFilters}
          tags={tags}
          categories={categories}
          stores={stores}
        />

        <TransactionsSummaryCards
          summary={summary}
          isLoading={isLoadingSummary}
        />

        <TransactionsCharts
          summary={summary}
          isLoading={isLoadingSummary}
          granularity={granularity}
          onGranularityChange={setGranularity}
          categoriesById={categoriesById}
        />

        <TableCustomAntd2<ITransaction>
          rowKey={"_id"}
          dataSource={transactions}
          columns={[
            {
              title: t("transactions.name"),
              dataIndex: "name",
              key: "name",
              render: (name: string, transaction: ITransaction) => (
                <div className="flex flex-col">
                  <span>{name}</span>

                  {transaction.note && (
                    <span className="text-[11px] leading-tight italic text-gray-400 dark:text-gray-500">
                      {transaction.note}
                    </span>
                  )}
                </div>
              ),
            },
            {
              title: t("transactions.type"),
              dataIndex: "type",
              key: "type",
              align: "center",
              render: (type: TransactionsEnum.Type) => (
                <Tag color={TransactionsEnum.TypeColors[type]}>
                  {t(TransactionsEnum.TypeLabels[type])}
                </Tag>
              ),
            },
            {
              title: t("transactions.value"),
              dataIndex: "value",
              key: "value",
              align: "center",
              sorter: true,
              render: (value: number, transaction: ITransaction) => (
                <span
                  className={
                    transaction.type === TransactionsEnum.Type.INCOME
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                >
                  {transaction.type === TransactionsEnum.Type.INCOME
                    ? "+"
                    : "-"}{" "}
                  {formatToMoneyDecimal(value)}
                </span>
              ),
            },
            {
              title: t("transactions.status"),
              dataIndex: "status",
              key: "status",
              align: "center",
              render: (status: TransactionsEnum.Status) => (
                <Tag color={TransactionsEnum.StatusColors[status]}>
                  {t(TransactionsEnum.StatusLabels[status])}
                </Tag>
              ),
            },
            {
              title: t("transactions.date"),
              dataIndex: "createdDate",
              key: "createdDate",
              align: "center",
              sorter: true,
              render: (createdDate: Date) =>
                moment(createdDate).format(DatesEnum.Format.DDMMYYY),
            },
            {
              title: t("transactions.categories"),
              dataIndex: "categoriesIds",
              key: "categoriesIds",
              render: (ids: string[]) =>
                ids?.length
                  ? ids.map((id) => (
                      <Tag key={id}>{categoriesById[id] ?? id}</Tag>
                    ))
                  : "-",
            },
            {
              title: t("common.actions"),
              key: "actions",
              align: "center",
              render: (_: unknown, transaction: ITransaction) => (
                <div className="flex items-center justify-center gap-2">
                  <Tooltip title={t("common.edit")}>
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<EditOutlined />}
                      aria-label={t("common.edit")}
                      onClick={() => setDrawer({ isOpen: true, transaction })}
                    />
                  </Tooltip>

                  <Popconfirm
                    title={t("transactions.deleteTitle")}
                    description={t("transactions.deleteDescription")}
                    okText={t("common.yes")}
                    cancelText={t("common.no")}
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleRemove(transaction)}
                  >
                    <Button
                      danger
                      type="primary"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      aria-label={t("common.delete")}
                    />
                  </Popconfirm>
                </div>
              ),
            },
          ]}
          search={{ placeholder: t("transactions.searchTransactions") }}
          loading={isLoadingGrid}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          total={total}
        />
      </Card>

      <TransactionDetailDrawer
        isOpen={drawer.isOpen}
        transaction={drawer.transaction}
        tags={tags}
        categories={categories}
        stores={stores}
        onClose={() => setDrawer({ isOpen: false, transaction: null })}
        onOk={async () => {
          setDrawer({ isOpen: false, transaction: null });

          await refreshAll();
        }}
      />
    </Layout>
  );
}
