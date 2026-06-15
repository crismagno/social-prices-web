import React from "react";

import {
  Card,
  Col,
  Descriptions,
  Divider,
  Input,
  Row,
  Select,
  Tag,
} from "antd";

import useLanguageData from "../../../../data/context/language/useLanguageData";

import ContainerTitle from "../../../../components/common/ContainerTitle/ContainerTitle";
import {
  ISale,
  ISalePayment,
} from "../../../../shared/business/sales/sale.interface";
import SalesEnum from "../../../../shared/business/sales/sales.enum";
import {
  getTotalAfterPayment,
  getTotalPayment,
} from "../../../../shared/business/sales/sales.utils";
import { formatToMoneyDecimal } from "../../../../shared/utils/strings/string";
import SalesMissingPaymentLabel from "../SalesTable/SalesMissingPaymentLabel";

interface Props {
  sale: ISale;
  title?: any;
}

export const SalePaymentsReadOnly: React.FC<Props> = ({ sale, title }) => {
  const { t } = useLanguageData();

  const totalFinal: number = sale.totals.totalFinalAmount;

  const totalPayment: number = getTotalPayment(sale);

  const totalAfterPayment: number = getTotalAfterPayment(sale, totalPayment);

  return (
    <Card
      title={
        title ? (
          title
        ) : (
          <div className="flex justify-between">
            <div>
              <label className="mr-2">{`${t("sales.payment")}: ${sale.number}`}</label>
            </div>
          </div>
        )
      }
    >
      <ContainerTitle
        title={
          <div className="flex items-center">
            <label className="mr-4">{t("sales.payment")}</label>
          </div>
        }
      >
        {sale.payments.map((salePayment: ISalePayment, index: number) => {
          return (
            <Row gutter={[8, 8]} key={index} className="mt-2">
              <Col xs={10}>
                <Select className="w-full" value={salePayment.type}>
                  <Select.Option
                    key={salePayment.type}
                    value={salePayment.type}
                  >
                    <Tag color={SalesEnum.PaymentTypeColors[salePayment.type]}>
                      {t(SalesEnum.PaymentTypeLabels[salePayment.type])}
                    </Tag>
                  </Select.Option>
                </Select>
              </Col>

              <Col xs={9}>
                <Input
                  readOnly
                  value={formatToMoneyDecimal(salePayment.amount)}
                />
              </Col>
            </Row>
          );
        })}
      </ContainerTitle>

      <Divider />

      <Descriptions
        bordered
        size="small"
        styles={{ label: { width: 200 } }}
        className="sm:w-full"
      >
        <Descriptions.Item label={t("common.total")} span={3}>
          {formatToMoneyDecimal(totalFinal)}
        </Descriptions.Item>

        <Descriptions.Item label={t("sales.totalPayment")} span={3}>
          {formatToMoneyDecimal(totalPayment)}
        </Descriptions.Item>

        <Descriptions.Item label={t("sales.totalAfterPayment")} span={3}>
          {formatToMoneyDecimal(totalAfterPayment)}

          <SalesMissingPaymentLabel totalAfterPayment={totalAfterPayment} />
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
