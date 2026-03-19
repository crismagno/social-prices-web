import { useState } from "react";

import { Button, Divider, Input, message, Tooltip } from "antd";

import { SendOutlined } from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import {
  ISale,
  ISaleBuyer,
  ISaleStore,
} from "../../../shared/business/sales/sale.interface";
import { DownloadSalesSummaryButton } from "../DownloadSalesSummaryButton/DownloadSalesSummaryButton";
import handleClientError from "../HandleClientError/HandleClientError";

interface Props {
  sale: ISale | null;
}

export const SendSaleSummary: React.FC<Props> = ({ sale }) => {
  let saleStores: ISaleStore[] = sale?.stores ?? [];

  const customer: ICustomer | undefined = saleStores?.[0].customer;

  const buyer: ISaleBuyer | null = sale?.buyer ?? null;

  const [emailToSend, setEmailToSend] = useState<string>(
    customer?.email ?? buyer?.email ?? ""
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { t } = useLanguageData();

  if (!sale || !customer || !buyer) {
    return null;
  }

  const handleSendEmail = async () => {
    const messageLoading = message.loading(
      t("sales.sendingSaleSummaryMessage"),
      0
    );

    try {
      setIsSubmitting(true);

      await serviceMethodsInstance.salesServiceMethods.sendSaleSummaryLink({
        saleId: sale._id,
        toEmail: emailToSend,
      });

      message.success(t("sales.sentMessage"));
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
      messageLoading?.();
    }
  };

  return (
    <div className="w-full">
      <div className="flex">
        <Tooltip title={t("sales.enterEmailToSendSaleSummary")}>
          <Input
            disabled={isSubmitting}
            className="mr-1 flex-1"
            onChange={(e) => setEmailToSend(e.target.value)}
            value={emailToSend}
          />
        </Tooltip>

        <Tooltip title={t("sales.sendSaleSummaryViaEmail")}>
          <Button
            loading={isSubmitting}
            disabled={isSubmitting}
            onClick={handleSendEmail}
            type="primary"
            className="mr-1"
            icon={<SendOutlined />}
          />
        </Tooltip>

        <DownloadSalesSummaryButton sale={sale} />
      </div>

      <Divider className="my-2" />
    </div>
  );
};
