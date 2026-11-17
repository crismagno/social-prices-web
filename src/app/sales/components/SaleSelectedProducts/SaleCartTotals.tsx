import { Col, Row, Tooltip } from "antd";
import TextArea from "antd/es/input/TextArea";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import { ISale } from "../../../../shared/business/sales/sale.interface";
import SalesEnum from "../../../../shared/business/sales/sales.enum";
import {
  getQuantity,
  getTotalAfterDiscount,
} from "../../../../shared/business/sales/sales.utils";
import { formatToMoneyDecimal } from "../../../../shared/utils/strings/string";

interface Props {
  sale: ISale;
}

// The cart's money breakdown: subtotal, discount, shipping, tax and total,
// each with the note the store left on it. Shared by the store's sale page
// and the customer's purchase page.
export const SaleCartTotals: React.FC<Props> = ({ sale }) => {
  const { t } = useLanguageData();

  const quantityTotal = getQuantity(sale);

  const totalAfterDiscount: number = getTotalAfterDiscount(sale);

  return (
    <div className="mt-5">
      {/* Subtotal */}
      <Row className="p-2 px-4 bg-zinc-100 text-black font-bold">
        <Col xs={4}>{t("common.subtotal")}:</Col>

        <Col xs={16} className="text-end">
          <Tooltip title={t("sales.sumAllPricesProducts")}>
            {formatToMoneyDecimal(sale.totals.subtotalAmount)}
          </Tooltip>
        </Col>
      </Row>

      {/* Discount */}
      <Row className="border-b px-4 border-slate-100 p-2">
        <Col xs={4}>
          <label className="font-semibold mr-2">{t("common.discount")}:</label>
        </Col>

        <Col xs={16} className="text-end">
          <Tooltip title={t("sales.discountAmount")}>
            -{" "}
            {formatToMoneyDecimal(
              sale.totals.discount
                ? sale.totals.discount.distributed.amount
                : 0,
            )}
          </Tooltip>
        </Col>

        <Col xs={24} className="py-2">
          <label className="font-semibold">{t("common.note")}: </label>

          <Tooltip title={sale.totals?.discount?.distributed?.note || ""}>
            <TextArea
              readOnly
              value={sale.totals?.discount?.distributed?.note || ""}
            />
          </Tooltip>
        </Col>
      </Row>

      {/* Total Discount */}
      <Row className="p-2 px-4 bg-zinc-100 text-black font-bold">
        <Col xs={4}>{t("sales.subtotalAfterDiscount")}</Col>

        <Col xs={16} className="text-end">
          <Tooltip title={t("sales.sumTotalAfterDiscounts")}>
            - {formatToMoneyDecimal(totalAfterDiscount)}
          </Tooltip>
        </Col>
      </Row>

      {/* Shipping */}
      {sale.header.deliveryType === SalesEnum.DeliveryType.DELIVERY && (
        <Row className="border-b px-4 border-slate-100 p-2">
          <Col xs={4}>
            <label className="font-semibold mr-2">
              {t("common.shipping")}:
            </label>
          </Col>

          <Col xs={16} className="text-end">
            <Tooltip title={t("sales.shippingAmount")}>
              {formatToMoneyDecimal(
                sale.totals.shipping ? sale.totals.shipping.amount : 0,
              )}
            </Tooltip>
          </Col>

          <Col xs={24}>
            <label className="font-semibold">{t("common.note")}: </label>

            <Tooltip title={sale.totals?.shipping?.note || ""}>
              <TextArea readOnly value={sale.totals?.shipping?.note || ""} />
            </Tooltip>
          </Col>
        </Row>
      )}

      {/* Tax */}
      <Row className="border-b px-4 border-slate-100 p-2">
        <Col xs={4}>
          <label className="font-semibold mr-2">{t("common.tax")}:</label>
        </Col>

        <Col xs={16} className="text-end">
          <Tooltip title={t("sales.taxAmount")}>
            {formatToMoneyDecimal(sale.totals.tax ? sale.totals.tax.amount : 0)}
          </Tooltip>
        </Col>

        <Col xs={24}>
          <label className="font-semibold">{t("common.note")}: </label>

          <Tooltip title={sale.totals?.tax?.note || ""}>
            <TextArea readOnly value={sale.totals?.tax?.note || ""} />
          </Tooltip>
        </Col>
      </Row>

      {/* Total */}
      <Row className="p-2 px-4 bg-emerald-50 text-black font-bold">
        <Col xs={4}>{t("common.total")}:</Col>

        <Col xs={9} className="text-end">
          <Tooltip title={t("sales.productQuantity")}>
            {t("sales.productQty")}: {quantityTotal}
          </Tooltip>
        </Col>
        <Col xs={7} className="text-end">
          <Tooltip title={t("sales.sumAllPricesProducts")}>
            {formatToMoneyDecimal(sale.totals.totalFinalAmount)}
          </Tooltip>
        </Col>
      </Row>
    </div>
  );
};
