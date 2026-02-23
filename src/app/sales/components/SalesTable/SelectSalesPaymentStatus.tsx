"use client";
import {
  memo,
  useState,
} from 'react';

import {
  Button,
  message,
  Modal,
  Select,
  Tag,
  Tooltip,
} from 'antd';
import { map } from 'lodash';

import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';

import handleClientError
  from '../../../../components/common/HandleClientError/HandleClientError';
import {
  LabelBadgeCustomAntd,
} from '../../../../components/common/LabelBadgeCustomAntd/LabelBadgeCustomAntd';
import useLanguageData from '../../../../data/context/language/useLanguageData';
import {
  serviceMethodsInstance,
} from '../../../../services/social-prices-api/service-methods';
import {
  ISale,
  ISalePayment,
} from '../../../../shared/business/sales/sale.interface';
import SalesEnum from '../../../../shared/business/sales/sales.enum';
import {
  getTotalAfterPayment,
  getTotalPayment,
} from '../../../../shared/business/sales/sales.utils';
import {
  SalePaymentsReadOnly,
} from '../SalePaymentsReadOnly/SalePaymentsReadOnly';
import {
  TFormUpdateSalePaymentsSchema,
  TSalePaymentFormSchema,
  UpdateSalePayments,
} from '../UpdateSalePayments/UpdateSalePayments';

export interface Props {
  sale: ISale;
  onUpdatePaymentStatusManual: (sale: ISale) => void;
}

enum LastEventEnum {
  COMPLETED = "COMPLETED",
  UPDATED = "UPDATED",
}

const SelectSalesPaymentStatus: React.FC<Props> = ({
  sale,
  onUpdatePaymentStatusManual,
}) => {
  const { t } = useLanguageData();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [
    isVisibleUpdateSalePaymentsModal,
    setIsVisibleUpdateSalePaymentsModal,
  ] = useState<boolean>(false);

  const [
    isVisibleSalePaymentsReadOnlyModal,
    setIsVisibleSalePaymentsReadOnlyModal,
  ] = useState<boolean>(false);

  const [lastEvent, setLastEvent] = useState<LastEventEnum | undefined>(
    undefined
  );

  const [newPaymentStatus, setNewPaymentStatus] =
    useState<SalesEnum.PaymentStatus>(sale.paymentStatus);

  const validatePayment = (lastEventParam: LastEventEnum) => {
    const totalAfterPayment: number = getTotalAfterPayment(
      sale,
      getTotalPayment(sale)
    );

    if (totalAfterPayment !== 0) {
      setIsVisibleUpdateSalePaymentsModal(true);
      setLastEvent(lastEventParam);
      return false;
    }

    return true;
  };

  const handleUpdatePaymentStatusSale = async (
    shouldValidatePayment: boolean = true,
    newPayments: ISalePayment[]
  ) => {
    try {
      if (
        shouldValidatePayment &&
        newPaymentStatus === SalesEnum.PaymentStatus.COMPLETED &&
        !validatePayment(LastEventEnum.UPDATED)
      ) {
        return;
      }

      setIsSubmitting(true);

      const response: ISale =
        await serviceMethodsInstance.salesServiceMethods.updatePaymentStatusManual(
          {
            saleId: sale._id,
            newPayments,
            newPaymentStatus,
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
    shouldValidatePayment: boolean = true,
    newPayments: ISalePayment[]
  ) => {
    try {
      if (shouldValidatePayment && !validatePayment(LastEventEnum.COMPLETED)) {
        return;
      }

      setIsSubmitting(true);

      const response: ISale =
        await serviceMethodsInstance.salesServiceMethods.updatePaymentStatusManual(
          {
            newPayments,
            newPaymentStatus: SalesEnum.PaymentStatus.COMPLETED,
            saleId: sale._id,
          }
        );

      message.success(`Sale ${sale.number} payment completed!`);

      onUpdatePaymentStatusManual(response);

      setNewPaymentStatus(SalesEnum.PaymentStatus.COMPLETED);
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

          <Tooltip title="Update">
            <Button
              type="primary"
              size="small"
              onClick={() => handleUpdatePaymentStatusSale(true, sale.payments)}
              icon={<CheckOutlined />}
              loading={isSubmitting}
              className="mr-1"
            />
          </Tooltip>
          <Tooltip title="Cancel update">
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
        <div className="w-40">
          <Tag
            color={SalesEnum.PaymentStatusColors[sale.paymentStatus]}
            className="mr-1"
          >
            {SalesEnum.PaymentStatusLabels[sale.paymentStatus]}
          </Tag>
          <Tooltip title={t("sales.edit")}>
            <Button
              type="default"
              size="small"
              onClick={() => setIsEditing(true)}
              icon={<EditOutlined />}
              loading={isSubmitting}
              className="mr-1"
            />
          </Tooltip>

          <Tooltip title={t("sales.seePayments")}>
            <Button
              type="default"
              size="small"
              onClick={() => setIsVisibleSalePaymentsReadOnlyModal(true)}
              icon={<EyeOutlined />}
              disabled={isSubmitting}
              className="mr-1"
            />
          </Tooltip>

          {sale.paymentStatus !== SalesEnum.PaymentStatus.COMPLETED && (
            <Tooltip title="Complete">
              <Button
                type="success"
                size="small"
                onClick={() =>
                  handleCompleteSalePaymentStatus(true, sale.payments)
                }
                icon={<CheckOutlined />}
                loading={isSubmitting}
              />
            </Tooltip>
          )}
        </div>
      )}

      <Modal
        open={isVisibleUpdateSalePaymentsModal}
        title={false}
        onCancel={() => setIsVisibleUpdateSalePaymentsModal(false)}
        footer={null}
        width={600}
        closeIcon={false}
        closable={false}
        maskClosable={false}
      >
        <UpdateSalePayments
          sale={sale}
          onConfirm={async (formPayments: TFormUpdateSalePaymentsSchema) => {
            setIsVisibleUpdateSalePaymentsModal(false);

            const newPayments: ISalePayment[] = map(
              formPayments.payments,
              (payment: TSalePaymentFormSchema) => ({
                amount: payment.amount,
                type: payment.type as SalesEnum.PaymentType,
                status: newPaymentStatus,
                provider: null,
              })
            );

            if (lastEvent === LastEventEnum.COMPLETED) {
              await handleCompleteSalePaymentStatus(false, newPayments);
            } else {
              await handleUpdatePaymentStatusSale(false, newPayments);
            }

            setLastEvent(undefined);
          }}
          onCancel={() => {
            setIsVisibleUpdateSalePaymentsModal(false);
            setLastEvent(undefined);
          }}
        />
      </Modal>

      <Modal
        open={isVisibleSalePaymentsReadOnlyModal}
        title={false}
        onCancel={() => setIsVisibleSalePaymentsReadOnlyModal(false)}
        okButtonProps={{ hidden: true }}
        cancelText="Ok"
        cancelButtonProps={{ type: "primary" }}
        closeIcon={false}
        width={600}
      >
        <SalePaymentsReadOnly sale={sale} />
      </Modal>
    </>
  );
};

export default memo(SelectSalesPaymentStatus);
