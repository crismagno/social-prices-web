import React from "react";

import {
  Card,
  Col,
  Descriptions,
  Divider,
  Row,
  Select,
  Tag,
  Tooltip,
} from "antd";
import { Control, FieldErrors, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { QuestionCircleTwoTone } from "@ant-design/icons";

import ButtonCommon from "../../../../../components/common/ButtonCommon/ButtonCommon";
import ContainerTitle from "../../../../../components/common/ContainerTitle/ContainerTitle";
import {
  IconPlus,
  IconTrash,
} from "../../../../../components/common/icons/icons";
import { InputNumberCustomAntd } from "../../../../../components/custom/antd/InputNumberCustomAntd/InputNumberCustomAntd";
import { SelectCustomAntd } from "../../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import useLanguageData from "../../../../../data/context/language/useLanguageData";
import SalesEnum from "../../../../../shared/business/sales/sales.enum";
import {
  formatterMoney,
  formatToMoneyDecimal,
  parserMoney,
} from "../../../../../shared/utils/strings/string";
import SalesMissingPaymentLabel from "../../../components/SalesTable/SalesMissingPaymentLabel";
import { TFormSchema } from "../../page";

export const salePaymentFormSchema = z.object({
  amount: z.number(),
  type: z.string().nonempty("Payment type is required"),
});

export type TSalePaymentFormSchema = z.infer<typeof salePaymentFormSchema>;

export const generateNewSalePayment = (): TSalePaymentFormSchema => ({
  type: SalesEnum.PaymentType.OTHER,
  amount: 0,
});

interface Props {
  control: Control<TFormSchema>;
  errors: FieldErrors<TFormSchema>;
  containerExtraHeader?: any;
  totalFinal: number;
  totalPayment: number;
  totalAfterPayment: number;
}

export const SalePayments: React.FC<Props> = ({
  control,
  errors,
  containerExtraHeader,
  totalFinal,
  totalPayment,
  totalAfterPayment,
}) => {
  const { t } = useLanguageData();
  const {
    append,
    fields: fieldsPayments,
    remove,
  } = useFieldArray({
    control,
    name: "payments",
  });

  const addNewSalePayment = () => append(generateNewSalePayment());

  const removeNewSalePayment = (index: number) => {
    remove(index);

    if (fieldsPayments.length === 1) {
      addNewSalePayment();
    }
  };

  return (
    <Card
      title={
        <div className="flex">
          <label className="mr-2">{t("sales.payment")}</label>
          <Tooltip title={t("sales.paymentsTooltip")}>
            <QuestionCircleTwoTone />
          </Tooltip>
        </div>
      }
    >
      <ContainerTitle
        title={
          <div className="flex items-center">
            <label className="mr-4">{t("sales.addPayment")}</label>

            <Tooltip title={t("sales.addPayment")}>
              <ButtonCommon
                onClick={(e) => {
                  e.preventDefault();
                  addNewSalePayment();
                }}
                color="primary"
                className="rounded-r-full rounded-l-full"
              >
                {IconPlus()}
              </ButtonCommon>
            </Tooltip>
          </div>
        }
        extraHeader={containerExtraHeader}
      >
        {fieldsPayments.map((_, index: number) => {
          return (
            <Row gutter={[8, 8]} key={index} className="mt-2">
              <Col xs={9}>
                <SelectCustomAntd
                  divClassName="mt-0 mr-0"
                  className="w-full"
                  controller={{ control, name: `payments.${index}.type` }}
                  errorMessage={errors?.payments?.[index]?.type?.message}
                >
                  {Object.keys(SalesEnum.PaymentType).map(
                    (salePaymentType: string) => (
                      <Select.Option
                        key={salePaymentType}
                        value={salePaymentType}
                      >
                        <Tag
                          color={
                            SalesEnum.PaymentTypeColors[
                              salePaymentType as SalesEnum.PaymentType
                            ]
                          }
                        >
                          {
                            SalesEnum.PaymentTypeLabels[
                              salePaymentType as SalesEnum.PaymentType
                            ]
                          }
                        </Tag>
                      </Select.Option>
                    ),
                  )}
                </SelectCustomAntd>
              </Col>

              <Col xs={6}>
                <InputNumberCustomAntd
                  divClassName="w-full mt-0 mr-0 mr-2"
                  className="w-full"
                  min={0}
                  formatter={formatterMoney}
                  parser={parserMoney}
                  errorMessage={errors?.payments?.[index]?.amount?.message}
                  controller={{
                    control,
                    name: `payments.${index}.amount`,
                  }}
                />
              </Col>

              <Col xs={2}>
                <Tooltip title={t("sales.removePayment")}>
                  <ButtonCommon
                    onClick={(e) => {
                      e.preventDefault();
                      removeNewSalePayment(index);
                    }}
                    color="transparent"
                    className="rounded-r-full rounded-l-full shadow-none"
                  >
                    {IconTrash("w-3 h-3 text-red-500 hover:text-red-600")}
                  </ButtonCommon>
                </Tooltip>
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
        className="md:w-2/3 sm:w-full"
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
