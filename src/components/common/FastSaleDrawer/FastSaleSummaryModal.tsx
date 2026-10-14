import { Modal } from "antd";

import { useFindCategoriesByType } from "../../../app/categories/useFindCategoriesByType";
import { useFindTagsByType } from "../../../app/tags/useFindTagsByType";
import useLanguageData from "../../../data/context/language/useLanguageData";
import CategoriesEnum from "../../../shared/business/categories/categories.enum";
import { ISale } from "../../../shared/business/sales/sale.interface";
import { IStore } from "../../../shared/business/stores/stores.interface";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import { SaleSummary } from "../SaleSummary/SaleSummary";

interface Props {
  sale: ISale;
  stores: IStore[];
  onClose: () => void;
}

// Mounted only while open, so tags/categories are fetched on demand.
export const FastSaleSummaryModal: React.FC<Props> = ({
  sale,
  stores,
  onClose,
}) => {
  const { t } = useLanguageData();

  const { tags } = useFindTagsByType(TagsEnum.Type.SALE);

  const { categories } = useFindCategoriesByType(CategoriesEnum.Type.SALE);

  return (
    <Modal
      open
      title={t("sales.saleSummary")}
      width={700}
      footer={null}
      onCancel={onClose}
    >
      <SaleSummary
        sale={sale}
        stores={stores}
        tags={tags}
        categories={categories}
      />
    </Modal>
  );
};
