import React from "react";

import { Button, ButtonProps } from "antd";

import { DownloadOutlined } from "@ant-design/icons";

import { serviceMethodsInstance } from "../../../services/social-prices-api/ServiceMethods";
import handleClientError from "../handleClientError/handleClientError";

interface Props {
  loading?: boolean;
  btnProps?: ButtonProps;
  btnLabel?: string;
  filename: string;
}
export const DownloadFile: React.FC<Props> = ({
  loading,
  btnProps,
  btnLabel,
  filename,
}) => {
  const handleDownloadFile = async () => {
    try {
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
    }
  };

  return (
    <>
      <Button
        onClick={handleDownloadFile}
        loading={loading}
        icon={<DownloadOutlined />}
        {...btnProps}
      >
        {btnLabel ?? "Download"}
      </Button>
    </>
  );
};
