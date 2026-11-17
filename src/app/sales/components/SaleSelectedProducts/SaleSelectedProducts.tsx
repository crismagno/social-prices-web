import { Card, Empty, Tooltip } from "antd";

import { ProfileOutlined, QuestionCircleTwoTone } from "@ant-design/icons";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import { ICustomer } from "../../../../shared/business/customers/customer.interface";
import {
  ISale,
  ISaleBuyer,
} from "../../../../shared/business/sales/sale.interface";
import { SaleCartTotals } from "./SaleCartTotals";
import { SaleStoresProducts } from "./SaleStoresProducts";

interface Props {
  sale: ISale;
}

export const SaleSelectedProducts: React.FC<Props> = ({ sale }) => {
  const { t } = useLanguageData();

  const customer: ICustomer | undefined = sale?.stores?.[0].customer;

  const buyer: ISaleBuyer | null = sale?.buyer ?? null;

  if (!sale || !customer || !buyer) {
    return <Empty />;
  }

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <ProfileOutlined className="text-amber-500" />
          <span className="font-semibold">{t("sales.cart")}</span>
          <Tooltip title={t("sales.selectedProductsTooltip")}>
            <QuestionCircleTwoTone />
          </Tooltip>
        </div>
      }
      className="flex-1 border-l-4 border-l-amber-500"
    >
      <div style={{ maxHeight: 878 }}>
        <SaleStoresProducts sale={sale} />
      </div>

      <SaleCartTotals sale={sale} />
    </Card>
  );
};
