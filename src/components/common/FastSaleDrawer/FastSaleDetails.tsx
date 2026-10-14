import { Collapse, Input, Select } from "antd";

import { useFindCategoriesByType } from "../../../app/categories/useFindCategoriesByType";
import { useFindTagsByType } from "../../../app/tags/useFindTagsByType";
import useLanguageData from "../../../data/context/language/useLanguageData";
import CategoriesEnum from "../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../shared/business/categories/categories.interface";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import { ITag } from "../../../shared/business/tags/tags.interface";
import { sortArray } from "../../../shared/utils/array/array-functions";
import { TagCategoryCustomAntd } from "../TagCategoryCustomAntd/TagCategoryCustomAntd";
import { TagTagCustomAntd } from "../TagTagCustomAntd/TagTagCustomAntd";

export interface IFastSaleDetails {
  note: string;
  noteToCustomer: string;
  tagsIds: string[];
  categoriesIds: string[];
  deliveryAt: string;
  createdDate: string;
  numberManual: string;
}

export const emptyFastSaleDetails: IFastSaleDetails = {
  note: "",
  noteToCustomer: "",
  tagsIds: [],
  categoriesIds: [],
  deliveryAt: "",
  createdDate: "",
  numberManual: "",
};

interface Props {
  value: IFastSaleDetails;
  onChange: (value: IFastSaleDetails) => void;
}

export const FastSaleDetails: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useLanguageData();

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.SALE,
  );

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.SALE);

  const update = (patch: Partial<IFastSaleDetails>) =>
    onChange({ ...value, ...patch });

  return (
    <Collapse
      size="small"
      items={[
        {
          key: "details",
          label: t("common.details"),
          children: (
            <div className="flex flex-col gap-2">
              <Input.TextArea
                rows={2}
                maxLength={1000}
                placeholder={t("common.note")}
                value={value.note}
                onChange={(e) => update({ note: e.target.value })}
              />

              <Input.TextArea
                rows={2}
                maxLength={1000}
                placeholder={t("sales.noteToCustomer")}
                value={value.noteToCustomer}
                onChange={(e) => update({ noteToCustomer: e.target.value })}
              />

              <Select
                mode="multiple"
                loading={isLoadingTags}
                placeholder={t("sales.selectTags")}
                value={value.tagsIds}
                onChange={(tagsIds) => update({ tagsIds })}
                options={sortArray(tags, "name").map((tag: ITag) => ({
                  value: tag._id,
                  label: <TagTagCustomAntd tag={tag} useTag={false} />,
                }))}
              />

              <Select
                mode="multiple"
                loading={isLoadingCategories}
                placeholder={t("sales.selectCategories")}
                value={value.categoriesIds}
                onChange={(categoriesIds) => update({ categoriesIds })}
                options={sortArray(categories, "name").map(
                  (category: ICategory) => ({
                    value: category._id,
                    label: (
                      <TagCategoryCustomAntd
                        category={category}
                        useTag={false}
                      />
                    ),
                  }),
                )}
              />

              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col text-xs text-gray-500">
                  {t("sales.deliveryDate")}
                  <Input
                    type="date"
                    value={value.deliveryAt}
                    onChange={(e) => update({ deliveryAt: e.target.value })}
                  />
                </label>

                <label className="flex flex-col text-xs text-gray-500">
                  {t("sales.createdDate")}
                  <Input
                    type="date"
                    value={value.createdDate}
                    onChange={(e) => update({ createdDate: e.target.value })}
                  />
                </label>
              </div>

              <Input
                placeholder={t("sales.saleNumberManual")}
                value={value.numberManual}
                onChange={(e) => update({ numberManual: e.target.value })}
              />
            </div>
          ),
        },
      ]}
    />
  );
};
