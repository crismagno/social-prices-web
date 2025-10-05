import { useState } from "react";

import { Button, Tooltip } from "antd";

import { DownloadOutlined } from "@ant-design/icons";

import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { ISale } from "../../../shared/business/sales/sale.interface";
import handleClientError from "../handleClientError/handleClientError";

interface Props {
  sale: ISale;
  buttonText?: string;
}

export const DownloadSalesSummaryButton: React.FC<Props> = ({
  sale,
  buttonText,
}) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleDownloadSaleSummaryPdf = async () => {
    try {
      setIsDownloading(true);

      const response: Buffer =
        await serviceMethodsInstance.salesServiceMethods.downloadSaleSummaryPdf(
          sale._id
        );

      const url: string = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sale-summary-${sale.number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Tooltip title="Download sale summary">
      <Button
        onClick={handleDownloadSaleSummaryPdf}
        type="primary"
        icon={<DownloadOutlined />}
        loading={isDownloading}
        disabled={isDownloading}
      >
        {buttonText}
      </Button>
    </Tooltip>
  );
};
