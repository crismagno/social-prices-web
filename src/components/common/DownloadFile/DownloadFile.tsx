import React, { useState } from "react";

import { Button, ButtonProps } from "antd";

import { DownloadOutlined } from "@ant-design/icons";

import { serviceMethodsInstance } from "../../../services/social-prices-api/ServiceMethods";
import handleClientError from "../handleClientError/handleClientError";

interface Props {
  btnProps?: ButtonProps;
  btnLabel?: string;
  filename: string;
}
export const DownloadFile: React.FC<Props> = ({
  btnProps,
  btnLabel,
  filename,
}) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleDownloadFile = async () => {
    try {
      setIsDownloading(true);

      const response: Buffer =
        await serviceMethodsInstance.filesServiceMethods.download(filename);

      const url: string = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleDownloadFile}
        loading={isDownloading}
        icon={<DownloadOutlined />}
        {...btnProps}
      >
        {btnLabel ?? "Download"}
      </Button>
    </>
  );
};
