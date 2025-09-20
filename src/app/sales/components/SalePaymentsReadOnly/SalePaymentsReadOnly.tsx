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

import ContainerTitle from "../../../../components/common/ContainerTitle/ContainerTitle";
import {
  ISale,
  ISalePayment,
} from "../../../../shared/business/sales/sale.interface";
import SalesEnum from "../../../../shared/business/sales/sales.enum";
import { getTotalPayment } from "../../../../shared/business/sales/sales.utils";
import {
  formatterMoney,
  formatToMoneyDecimal,
  parserMoney,
} from "../../../../shared/utils/strings/string";

interface Props {
  sale: ISale;
}

export const SalePaymentsReadOnly: React.FC<Props> = ({ sale }) => {
  const totalFinal: number = sale.totals.totalFinalAmount;

  const totalPayment: number = getTotalPayment(sale);

  const totalAfterPayment: number = sale.totals.totalFinalAmount - totalPayment;

  return (
    <Card
      title={
        <div className="flex justify-between">
          <div>
            <label className="mr-2">Sale Payments: {sale.number}</label>
          </div>
        </div>
      }
    >
      <ContainerTitle
        title={
          <div className="flex items-center">
            <label className="mr-4">Payments</label>
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
                      {SalesEnum.PaymentTypeLabels[salePayment.type]}
                    </Tag>
                  </Select.Option>
                </Select>
              </Col>

              <Col xs={9}>
                <Input
                  formatter={formatterMoney}
                  parser={parserMoney}
                  readOnly
                  value={salePayment.amount}
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
        labelStyle={{ width: 200 }}
        className="sm:w-full"
      >
        <Descriptions.Item label="Total" span={3}>
          {formatToMoneyDecimal(totalFinal)}
        </Descriptions.Item>

        <Descriptions.Item label="Total Payment" span={3}>
          {formatToMoneyDecimal(totalPayment)}
        </Descriptions.Item>

        <Descriptions.Item label="Total After Payment" span={3}>
          {formatToMoneyDecimal(totalAfterPayment)}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
