"use client";

import React from "react";

import { find } from "lodash";

import { TagTagCustomAntd } from "../../../../components/common/TagTagCustomAntd/TagTagCustomAntd";
import { ISale } from "../../../../shared/business/sales/sale.interface";
import { ITag } from "../../../../shared/business/tags/tags.interface";

interface Props {
  sale: ISale | null;
  tags: ITag[];
}

export const SaleTagsList: React.FC<Props> = ({ sale, tags }) => {
  return (
    <div className="flex border rounded-md gap-2 flex-wrap p-3">
      {sale?.tagsIds?.map((tagId: string) => {
        const tag: ITag | undefined = find(tags, { _id: tagId });

        return tag ? <TagTagCustomAntd key={tagId} tag={tag} /> : null;
      })}
    </div>
  );
};
