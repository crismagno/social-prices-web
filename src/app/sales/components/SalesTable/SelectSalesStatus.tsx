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
  onUpdateStatusManual: (sale: ISale) => void;
}

const SelectSalesStatus: React.FC<Props> = ({ sale, onUpdateStatusManual }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [newSaleStatus, setNewSaleStatus] = useState<SalesEnum.Status>(
    sale.status
  );

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

  const handleUpdateStatusSale = async (
    shouldValidatePayment: boolean = true
  ) => {
    try {
      if (
        shouldValidatePayment &&
        newSaleStatus === SalesEnum.Status.COMPLETED &&
        !validatePayment(() => handleUpdateStatusSale(false))
      ) {
        return;
      }

      setIsSubmitting(true);

      const response: ISale =
        await serviceMethodsInstance.salesServiceMethods.updateStatusManual(
          sale._id,
          newSaleStatus
        );

      message.success(`Sale ${sale.number} status updated!`);

      onUpdateStatusManual(response);
      setIsEditing(false);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteSale = async (shouldValidatePayment: boolean = true) => {
    try {
      if (
        shouldValidatePayment &&
        !validatePayment(() => handleCompleteSale(false))
      ) {
        return;
      }

      setIsSubmitting(true);

      const response: ISale =
        await serviceMethodsInstance.salesServiceMethods.updateStatusManual(
          sale._id,
          SalesEnum.Status.COMPLETED
        );

      message.success(`Sale ${sale.number} completed!`);

      onUpdateStatusManual(response);
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
            onChange={setNewSaleStatus}
            value={newSaleStatus}
            size="small"
            className="mr-1 w-32"
          >
            {Object.values(SalesEnum.Status).map((status: SalesEnum.Status) => (
              <Select.Option key={status} value={status}>
                <LabelBadgeCustomAntd
                  label={SalesEnum.StatusLabels[status]}
                  color={SalesEnum.StatusColors[status]}
                />
              </Select.Option>
            ))}
          </Select>

          <Tooltip title="Confirm update sale status">
            <Button
              type="primary"
              size="small"
              onClick={() => handleUpdateStatusSale()}
              icon={<CheckOutlined />}
              loading={isSubmitting}
              className="mr-1"
            />
          </Tooltip>
          <Tooltip title="Cancel update sale status">
            <Button
              type="default"
              size="small"
              onClick={() => {
                setIsEditing(false);
                setNewSaleStatus(sale.status);
              }}
              icon={<CloseOutlined />}
              loading={isSubmitting}
            />
          </Tooltip>
        </div>
      ) : (
        <div className="w-40">
          <Tag color={SalesEnum.StatusColors[sale.status]} className="mr-1">
            {SalesEnum.StatusLabels[sale.status]}
          </Tag>
          <Tooltip title="Edit sale status">
            <Button
              type="default"
              size="small"
              onClick={() => setIsEditing(true)}
              icon={<EditOutlined />}
              loading={isSubmitting}
              className="mr-1"
            />
          </Tooltip>

          {sale.status !== SalesEnum.Status.COMPLETED && (
            <Tooltip title="Complete">
              <Button
                type="success"
                size="small"
                onClick={() => handleCompleteSale()}
                icon={<CheckOutlined />}
                loading={isSubmitting}
              />
            </Tooltip>
          )}
        </div>
      )}
    </>
  );
};

export default memo(SelectSalesStatus);
