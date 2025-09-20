import { useState } from "react";

import { Button, Divider, Input, Tooltip } from "antd";

import { DownloadOutlined, SendOutlined } from "@ant-design/icons";

import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import {
  ISale,
  ISaleBuyer,
  ISaleStore,
} from "../../../shared/business/sales/sale.interface";
import handleClientError from "../handleClientError/handleClientError";

interface Props {
  sale: ISale | null;
}

export const SendSaleResume: React.FC<Props> = ({ sale }) => {
  let saleStores: ISaleStore[] = sale?.stores ?? [];

  const customer: ICustomer | undefined = saleStores?.[0].customer;

  const buyer: ISaleBuyer | null = sale?.buyer ?? null;

  const [emailToSend, setEmailToSend] = useState<string>(
    customer?.email ?? buyer?.email ?? ""
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!sale || !customer || !buyer) {
    return null;
  }

  const handleSendEmail = () => {
    try {
      setIsSubmitting(true);

      console.log(`Sending email`);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadSalePdf = async () => {
    try {
      setIsSubmitting(true);

      const response: Buffer =
        await serviceMethodsInstance.salesServiceMethods.downloadSalePdf(
          sale._id
        );

      const url: string = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sale-${sale.number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex">
        <Tooltip title="Enter the email address where you want to send the sale summary">
          <Input
            className="mr-1"
            onChange={(e) => setEmailToSend(e.target.value)}
            value={emailToSend}
            style={{ width: "85%" }}
          />
        </Tooltip>

        <Tooltip title="Send sale resume via email">
          <Button
            onClick={handleSendEmail}
            type="primary"
            className="mr-1"
            icon={<SendOutlined />}
          />
        </Tooltip>

        <Tooltip title="Download sale resume">
          <Button
            onClick={handleDownloadSalePdf}
            type="primary"
            icon={<DownloadOutlined />}
          />
        </Tooltip>
      </div>

      <Divider className="my-2" />
    </div>
  );
};
