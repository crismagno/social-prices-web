import { Col, Row, Select, Tooltip } from "antd";
import { useFieldArray } from "react-hook-form";
import { z } from "zod";

import ButtonCommon from "../../../../../components/common/ButtonCommon/ButtonCommon";
import ContainerTitle from "../../../../../components/common/ContainerTitle/ContainerTitle";
import {
  IconPlus,
  IconTrash,
} from "../../../../../components/common/icons/icons";
import { InputNumberCustomAntd } from "../../../../../components/custom/antd/InputNumberCustomAntd/InputNumberCustomAntd";
import { SelectCustomAntd } from "../../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import SalesEnum from "../../../../../shared/business/sales/sales.enum";
import StoresEnum from "../../../../../shared/business/stores/stores.enum";
import {
  formatterMoney,
  parserMoney,
} from "../../../../../shared/utils/string-extensions/string-extensions";

export const salePaymentFormSchema = z.object({
  amount: z.number(),
  type: z.string().nonempty("Payment type is required"),
});

export type TSalePaymentFormSchema = z.infer<typeof salePaymentFormSchema>;

export const generateNewSalePayment = (): TSalePaymentFormSchema => ({
  type: StoresEnum.Type.OTHER,
  amount: 0,
});

interface Props {
  control: any;
  errors: any;
  containerExtraHeader?: any;
}

export const SalePayments: React.FC<Props> = ({
  control,
  errors,
  containerExtraHeader,
}) => {
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
    <ContainerTitle
      title={
        <div className="flex items-center">
          <label className="mr-4">Payments</label>

          <Tooltip title="Add a payment">
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
            <Col xs={8}>
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
                      {
                        SalesEnum.PaymentTypeLabels[
                          salePaymentType as SalesEnum.PaymentType
                        ]
                      }
                    </Select.Option>
                  )
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
              <Tooltip title="Remove payment">
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
  );
};
