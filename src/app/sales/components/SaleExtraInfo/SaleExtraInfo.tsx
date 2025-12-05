import { ISale } from "../../../../shared/business/sales/sale.interface";
import { SaleActiveOrDeletedTag } from "../SaleActiveOrDeletedTag/SaleActiveOrDeletedTag";
import { SaleCreatedByEmployeeCard } from "../SaleCreatedByEmployeeCard/SaleCreatedByEmployeeCard";

interface Props {
  sale: ISale;
  allowEvents?: boolean;
  onRemoveSale?: (sale: ISale) => void;
  onActivateSale?: (sale: ISale) => void;
}

export const SaleExtraInfo: React.FC<Props> = ({
  sale,
  allowEvents,
  onRemoveSale,
  onActivateSale,
}) => {
  return (
    <div className="flex justify-between">
      <SaleActiveOrDeletedTag
        allowEvents={allowEvents}
        sale={sale}
        onActivateSale={onActivateSale}
        onRemoveSale={onRemoveSale}
      />

      <SaleCreatedByEmployeeCard sale={sale} />
    </div>
  );
};
