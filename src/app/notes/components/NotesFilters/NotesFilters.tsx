"use client";

import { Col, Row, Select } from "antd";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import { ICategory } from "../../../../shared/business/categories/categories.interface";
import NotesEnum from "../../../../shared/business/notes/notes.enum";
import { INoteFilters } from "../../../../shared/business/notes/notes.types";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import { SelectCustomer } from "../../../sales/create/components/SelectCustomer/SelectCustomer";

interface Props {
  filters: INoteFilters;
  onChange: (filters: INoteFilters) => void;
  tags: ITag[];
  categories: ICategory[];
  stores: IStore[];
}

export const NotesFilters: React.FC<Props> = ({
  filters,
  onChange,
  tags,
  categories,
  stores,
}) => {
  const { t } = useLanguageData();

  const update = (partial: Partial<INoteFilters>): void =>
    onChange({ ...filters, ...partial });

  return (
    <Row gutter={[12, 12]} className="mb-4">
      <Col xs={24} sm={12} lg={8}>
        <label className="font-bold block">{t("notes.status")}</label>

        <Select
          mode="multiple"
          allowClear
          className="w-full"
          value={filters.status ?? []}
          onChange={(status: NotesEnum.Status[]) => update({ status })}
          options={Object.keys(NotesEnum.Status).map((status: string) => ({
            value: status,
            label: t(NotesEnum.StatusLabels[status as NotesEnum.Status]),
          }))}
        />
      </Col>

      <Col xs={24} sm={12} lg={8}>
        <label className="font-bold block">{t("notes.categories")}</label>

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

      <Col xs={24} sm={12} lg={8}>
        <label className="font-bold block">{t("notes.tags")}</label>

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

      <Col xs={24} sm={12} lg={8}>
        <label className="font-bold block">{t("notes.stores")}</label>

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

      <Col xs={24} sm={12} lg={8}>
        <label className="font-bold block">{t("notes.customers")}</label>

        <SelectCustomer
          mode="multiple"
          value={filters.customerIds ?? []}
          onSelectCustomerIds={(customerIds) => update({ customerIds })}
          style={{ width: "100%" }}
        />
      </Col>
    </Row>
  );
};
