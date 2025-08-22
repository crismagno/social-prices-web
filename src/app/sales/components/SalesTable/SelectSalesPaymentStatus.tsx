"use client";
import { memo, useState } from "react";

import { Alert, Button, message, Modal, Select, Tag, Tooltip } from "antd";

import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  QuestionCircleTwoTone,
} from "@ant-design/icons";

import handleClientError from "../../../../components/common/handleClientError/handleClientError";
import { LabelBadgeCustomAntd } from "../../../../components/common/LabelBadgeCustomAntd/LabelBadgeCustomAntd";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import { ISale } from "../../../../shared/business/sales/sale.interface";
import SalesEnum from "../../../../shared/business/sales/sales.enum";
import { getTotalPayment } from "../../../../shared/business/sales/sales.utils";

export interface Props {
  sale: ISale;
  onUpdatePaymentStatusManual: (sale: ISale) => void;
}

const SelectSalesPaymentStatus: React.FC<Props> = ({
  sale,
  onUpdatePaymentStatusManual,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [newPaymentStatus, setNewPaymentStatus] =
    useState<SalesEnum.PaymentStatus>(sale.paymentStatus);

  const validatePayment = (handleEvent: Function) => {
    const totalAfterPayment: number =
      sale.totals.totalFinalAmount - getTotalPayment(sale);

    if (totalAfterPayment !== 0) {
      Modal.confirm({
        title: `Confirm Payment`,
        icon: <QuestionCircleTwoTone />,
        content: (
          <Alert
            message={`Please confirm total after payment, and payment status? Sale Number: ${sale.number}`}
            type="warning"
            showIcon
          />
        ),
        okText: "Confirm",
        cancelText: "Cancel",
        onOk: () => handleEvent(),
        onCancel: () => false,
      });

      return false;
    }

    return true;
  };

  const handleUpdatePaymentStatusSale = async (
    shouldValidatePayment: boolean = true
  ) => {
    try {
      if (
        shouldValidatePayment &&
        newPaymentStatus === SalesEnum.PaymentStatus.COMPLETED &&
        !validatePayment(() => handleUpdatePaymentStatusSale(false))
      ) {
        return;
      }

      setIsSubmitting(true);

      const response: ISale =
        await serviceMethodsInstance.salesServiceMethods.updatePaymentStatusManual(
          {
            saleId: sale._id,
            newPayments: sale.payments,
            newPaymentStatus: newPaymentStatus,
          }
        );

      message.success(`Sale ${sale.number} payment status updated!`);

      onUpdatePaymentStatusManual(response);
      setIsEditing(false);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteSalePaymentStatus = async (
    shouldValidatePayment: boolean = true
  ) => {
    try {
      if (
        shouldValidatePayment &&
        !validatePayment(() => handleCompleteSalePaymentStatus(false))
      ) {
        return;
      }

      setIsSubmitting(true);

      const response: ISale =
        await serviceMethodsInstance.salesServiceMethods.updatePaymentStatusManual(
          {
            newPayments: sale.payments,
            newPaymentStatus: SalesEnum.PaymentStatus.COMPLETED,
            saleId: sale._id,
          }
        );

      message.success(`Sale ${sale.number} payment completed!`);

      onUpdatePaymentStatusManual(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isEditing ? (
        <div className="w-48">
          <Select
            onChange={setNewPaymentStatus}
            value={newPaymentStatus}
            size="small"
            className="mr-1 w-32"
          >
            {Object.values(SalesEnum.PaymentStatus).map(
              (paymentStatus: SalesEnum.PaymentStatus) => (
                <Select.Option key={paymentStatus} value={paymentStatus}>
                  <LabelBadgeCustomAntd
                    label={SalesEnum.PaymentStatusLabels[paymentStatus]}
                    color={SalesEnum.PaymentStatusColors[paymentStatus]}
                  />
                </Select.Option>
              )
            )}
          </Select>

          <Tooltip title="Confirm update sale payment status">
            <Button
              type="success"
              size="small"
              onClick={() => handleUpdatePaymentStatusSale()}
              icon={<CheckOutlined />}
              loading={isSubmitting}
              className="mr-1"
            />
          </Tooltip>
          <Tooltip title="Cancel update sale payment status">
            <Button
              type="default"
              size="small"
              onClick={() => {
                setIsEditing(false);
                setNewPaymentStatus(sale.paymentStatus);
              }}
              icon={<CloseOutlined />}
              loading={isSubmitting}
            />
          </Tooltip>
        </div>
      ) : (
        <div className="w-36">
          <Tag
            color={SalesEnum.PaymentStatusColors[sale.paymentStatus]}
            className="mr-1"
          >
            {SalesEnum.PaymentStatusLabels[sale.paymentStatus]}
          </Tag>
          <Tooltip title="Edit sale payment status">
            <Button
              type="default"
              size="small"
              onClick={() => setIsEditing(true)}
              icon={<EditOutlined />}
              loading={isSubmitting}
              className="mr-1"
            />
          </Tooltip>
          <Tooltip title="Complete">
            <Button
              type="success"
              size="small"
              onClick={() => handleCompleteSalePaymentStatus()}
              icon={<CheckOutlined />}
              loading={isSubmitting}
            />
          </Tooltip>
        </div>
      )}
    </>
  );
};

export default memo(SelectSalesPaymentStatus);
