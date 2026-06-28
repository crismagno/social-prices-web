"use client";

import React from "react";

import { find } from "lodash";

import { TagCategoryCustomAntd } from "../../../../components/common/TagCategoryCustomAntd/TagCategoryCustomAntd";
import { ICategory } from "../../../../shared/business/categories/categories.interface";
import { ISale } from "../../../../shared/business/sales/sale.interface";

interface Props {
  sale: ISale | null;
  categories: ICategory[];
}

export const SaleCategoriesList: React.FC<Props> = ({ sale, categories }) => {
  return (
    <div className="flex border rounded-md gap-2 flex-wrap p-3">
      {sale?.categoriesIds?.map((categoryId: string) => {
        const category: ICategory | undefined = find(categories, {
          _id: categoryId,
        });

        return category ? (
          <TagCategoryCustomAntd key={categoryId} category={category} />
        ) : null;
      })}
    </div>
  );
};
