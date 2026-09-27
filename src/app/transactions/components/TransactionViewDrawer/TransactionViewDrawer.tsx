"use client";

import { Descriptions, Drawer, Tag } from "antd";
import moment from "moment";

import { TagCategoriesCustomAntd } from "../../../../components/common/TagCategoriesCustomAntd/TagCategoriesCustomAntd";
import { TagStoresCustomAntd } from "../../../../components/common/TagStoresCustomAntd/TagStoresCustomAntd";
import { TagTagsCustomAntd } from "../../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import { ICategory } from "../../../../shared/business/categories/categories.interface";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import { ITransaction } from "../../../../shared/business/transactions/transaction.interface";
import TransactionsEnum from "../../../../shared/business/transactions/transactions.enum";
import DatesEnum from "../../../../shared/utils/dates/dates.enum";
import { formatToMoneyDecimal } from "../../../../shared/utils/strings/string";

interface Props {
  transaction: ITransaction | null;
  categories: ICategory[];
  tags: ITag[];
  stores: IStore[];
  onClose: () => void;
}

export const TransactionViewDrawer: React.FC<Props> = ({
  transaction,
  categories,
  tags,
  stores,
  onClose,
}) => {
  const { t } = useLanguageData();

  return (
    <Drawer
      open={!!transaction}
      onClose={onClose}
      width={700}
      title={t("transactions.view")}
      destroyOnHidden
    >
      {transaction && (
        <>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t("transactions.name")}>
              {transaction.name}
            </Descriptions.Item>

            <Descriptions.Item label={t("transactions.type")}>
              <Tag color={TransactionsEnum.TypeColors[transaction.type]}>
                {t(TransactionsEnum.TypeLabels[transaction.type])}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t("transactions.value")}>
              <span
                className={
                  transaction.type === TransactionsEnum.Type.INCOME
                    ? "text-emerald-600"
                    : "text-red-600"
                }
              >
                {transaction.type === TransactionsEnum.Type.INCOME ? "+" : "-"}{" "}
                {formatToMoneyDecimal(transaction.value)}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label={t("transactions.status")}>
              <Tag color={TransactionsEnum.StatusColors[transaction.status]}>
                {t(TransactionsEnum.StatusLabels[transaction.status])}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t("transactions.date")}>
              {moment(transaction.createdDate).format(DatesEnum.Format.DDMMYYY)}
            </Descriptions.Item>

            <Descriptions.Item label={t("transactions.categories")}>
              {transaction.categoriesIds.length ? (
                <TagCategoriesCustomAntd
                  categories={categories}
                  categoriesIds={transaction.categoriesIds}
                />
              ) : (
                "-"
              )}
            </Descriptions.Item>

            <Descriptions.Item label={t("transactions.tags")}>
              {transaction.tagsIds.length ? (
                <TagTagsCustomAntd tags={tags} tagsIds={transaction.tagsIds} />
              ) : (
                "-"
              )}
            </Descriptions.Item>

            <Descriptions.Item label={t("transactions.stores")}>
              {transaction.storeIds.length ? (
                <TagStoresCustomAntd
                  stores={stores}
                  storeIds={transaction.storeIds}
                />
              ) : (
                "-"
              )}
            </Descriptions.Item>

            <Descriptions.Item label={t("transactions.createdAt")}>
              {moment(transaction.createdAt).format(
                DatesEnum.Format.DDMMYYYYhhmmss,
              )}
            </Descriptions.Item>
          </Descriptions>

          {transaction.note && (
            <>
              <h3 className="mt-5 mb-2 font-semibold">
                {t("transactions.note")}
              </h3>

              <p className="whitespace-pre-wrap break-words">
                {transaction.note}
              </p>
            </>
          )}
        </>
      )}
    </Drawer>
  );
};
