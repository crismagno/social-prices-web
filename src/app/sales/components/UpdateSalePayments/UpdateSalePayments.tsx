import { useEffect, useState } from "react";

import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Row,
  Select,
  Tag,
  Tooltip,
} from "antd";
import { reduce } from "lodash";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import ButtonCommon from "../../../../components/common/ButtonCommon/ButtonCommon";
import ContainerTitle from "../../../../components/common/ContainerTitle/ContainerTitle";
import { IconPlus, IconTrash } from "../../../../components/common/icons/icons";
import { InputNumberCustomAntd } from "../../../../components/custom/antd/InputNumberCustomAntd/InputNumberCustomAntd";
import { SelectCustomAntd } from "../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { ISale } from "../../../../shared/business/sales/sale.interface";
import SalesEnum from "../../../../shared/business/sales/sales.enum";
import {
  formatterMoney,
  formatToMoneyDecimal,
  parserMoney,
} from "../../../../shared/utils/strings/string";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import SalesMissingPaymentLabel from "../SalesTable/SalesMissingPaymentLabel";

export const salePaymentFormSchema = z.object({
  amount: z.number(),
  type: z.string().nonempty("Payment type is required"),
});

export type TSalePaymentFormSchema = z.infer<typeof salePaymentFormSchema>;

const formSchema = z.object({
  payments: z.array(salePaymentFormSchema),
});

export type TFormUpdateSalePaymentsSchema = z.infer<typeof formSchema>;

export const generateNewSalePayment = (): TSalePaymentFormSchema => ({
  type: SalesEnum.PaymentType.OTHER,
  amount: 0,
});

interface Props {
  sale: ISale;
  onConfirm: (
    formPayments: TFormUpdateSalePaymentsSchema
  ) => void | Promise<void>;
  onCancel: () => void;
}

export const UpdateSalePayments: React.FC<Props> = ({
  sale,
  onCancel,
  onConfirm,
}) => {
  const { t } = useLanguageData();
  const [formValues, setFormValues] = useState<TFormUpdateSalePaymentsSchema>({
    payments:
      sale.payments.length > 0 ? sale.payments : [generateNewSalePayment()],
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<TFormUpdateSalePaymentsSchema>({
    values: formValues,
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    setFormValues({
      payments:
        sale.payments.length > 0 ? sale.payments : [generateNewSalePayment()],
    });
  }, [sale]);

  const {
    append,
    fields: fieldsPayments,
    remove,
  } = useFieldArray({
    control,
    name: "payments",
  });

  const payments: TSalePaymentFormSchema[] = watch("payments");

  const addNewSalePayment = () => append(generateNewSalePayment());

  const removeNewSalePayment = (index: number) => {
    remove(index);

    if (fieldsPayments.length === 1) {
      addNewSalePayment();
    }
  };

  const totalFinal: number = sale.totals.totalFinalAmount;

  const getTotalPayment = (): number => {
    const total: number = reduce(
      payments,
      (acc: number, payment: TSalePaymentFormSchema) => {
        acc += payment.amount;

        return acc;
      },
      0
    );

    return total > 0 ? total : 0;
  };

  const totalPayment: number = getTotalPayment();

  const totalAfterPayment: number = sale.totals.totalFinalAmount - totalPayment;

  const onSubmit: SubmitHandler<TFormUpdateSalePaymentsSchema> = (
    data: TFormUpdateSalePaymentsSchema
  ) => {
    onConfirm(data);
  };

  return (
    <Card
      title={
        <div className="flex justify-between">
          <div>
            <label className="mr-2">{t("sales.updateSalePayments")}: {sale.number}</label>
          </div>
        </div>
      }
    >
      <ContainerTitle
        title={
          <div className="flex items-center">
            <label className="mr-4">{t("sales.payment")}</label>

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
      >
        {fieldsPayments.map((_, index: number) => {
          return (
            <Row gutter={[8, 8]} key={index} className="mt-2">
              <Col xs={10}>
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
                    )
                  )}
                </SelectCustomAntd>
              </Col>

              <Col xs={9}>
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

      <Divider />

      <div className="flex justify-end">
        <Button type="default" className="mr-2" onClick={onCancel}>
          {t("common.cancel")}
        </Button>

        <Button type="primary" onClick={handleSubmit(onSubmit)}>
          {t("common.confirm")}
        </Button>
      </div>
    </Card>
  );
};
