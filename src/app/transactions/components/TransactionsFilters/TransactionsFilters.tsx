"use client";

import { Col, InputNumber, Row, Select } from "antd";
import moment from "moment";

import { CustomRangeDatePicker } from "../../../../components/common/CustomRangeDatePicker/CustomRangeDatePicker";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import { ICategory } from "../../../../shared/business/categories/categories.interface";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import TransactionsEnum from "../../../../shared/business/transactions/transactions.enum";
import { ITransactionFilters } from "../../../../shared/business/transactions/transactions.types";

interface Props {
  filters: ITransactionFilters;
  onChange: (filters: ITransactionFilters) => void;
  tags: ITag[];
  categories: ICategory[];
  stores: IStore[];
}

export const TransactionsFilters: React.FC<Props> = ({
  filters,
  onChange,
  tags,
  categories,
  stores,
}) => {
  const { t } = useLanguageData();

  const update = (partial: Partial<ITransactionFilters>): void =>
    onChange({ ...filters, ...partial });

  return (
    <Row gutter={[12, 12]} className="mb-4">
      <Col xs={24} md={12} lg={8}>
        <label className="font-bold block">{t("transactions.period")}</label>

        <CustomRangeDatePicker
          onChange={(startDate: Date | null, endDate: Date | null) =>
            update({
              rangeDate:
                startDate || endDate
                  ? {
                      startDate: startDate
                        ? moment(startDate).startOf("day").toDate()
                        : null,
                      endDate: endDate
                        ? moment(endDate).endOf("day").toDate()
                        : null,
                    }
                  : undefined,
            })
          }
        />
      </Col>

      <Col xs={12} md={6} lg={4}>
        <label className="font-bold block">{t("transactions.type")}</label>

        <Select
          mode="multiple"
          allowClear
          className="w-full"
          value={filters.type ?? []}
          onChange={(type: TransactionsEnum.Type[]) => update({ type })}
          options={Object.keys(TransactionsEnum.Type).map((type: string) => ({
            value: type,
            label: t(
              TransactionsEnum.TypeLabels[type as TransactionsEnum.Type],
            ),
          }))}
        />
      </Col>

      <Col xs={12} md={6} lg={4}>
        <label className="font-bold block">{t("transactions.status")}</label>

        <Select
          mode="multiple"
          allowClear
          className="w-full"
          value={filters.status ?? []}
          onChange={(status: TransactionsEnum.Status[]) => update({ status })}
          options={Object.keys(TransactionsEnum.Status).map(
            (status: string) => ({
              value: status,
              label: t(
                TransactionsEnum.StatusLabels[
                  status as TransactionsEnum.Status
                ],
              ),
            }),
          )}
        />
      </Col>

      <Col xs={12} md={6} lg={4}>
        <label className="font-bold block">{t("transactions.valueMin")}</label>

        <InputNumber
          className="w-full"
          min={0}
          precision={2}
          value={filters.value?.min ?? null}
          onChange={(min) =>
            update({ value: { ...filters.value, min: min ?? null } })
          }
        />
      </Col>

      <Col xs={12} md={6} lg={4}>
        <label className="font-bold block">{t("transactions.valueMax")}</label>

        <InputNumber
          className="w-full"
          min={0}
          precision={2}
          value={filters.value?.max ?? null}
          onChange={(max) =>
            update({ value: { ...filters.value, max: max ?? null } })
          }
        />
      </Col>

      <Col xs={24} md={8}>
        <label className="font-bold block">
          {t("transactions.categories")}
        </label>

        <Select
          mode="multiple"
          allowClear
          className="w-full"
          optionFilterProp="label"
          value={filters.categoriesIds ?? []}
          onChange={(categoriesIds: string[]) => update({ categoriesIds })}
          options={categories.map((category: ICategory) => ({
            value: category._id,
            label: category.name,
          }))}
        />
      </Col>

      <Col xs={24} md={8}>
        <label className="font-bold block">{t("transactions.tags")}</label>

        <Select
          mode="multiple"
          allowClear
          className="w-full"
          optionFilterProp="label"
          value={filters.tagsIds ?? []}
          onChange={(tagsIds: string[]) => update({ tagsIds })}
          options={tags.map((tag: ITag) => ({
            value: tag._id,
            label: tag.name,
          }))}
        />
      </Col>

      <Col xs={24} md={8}>
        <label className="font-bold block">{t("transactions.stores")}</label>

        <Select
          mode="multiple"
          allowClear
          className="w-full"
          optionFilterProp="label"
          value={filters.storeIds ?? []}
          onChange={(storeIds: string[]) => update({ storeIds })}
          options={stores.map((store: IStore) => ({
            value: store._id,
            label: store.name,
          }))}
        />
      </Col>
    </Row>
  );
};
