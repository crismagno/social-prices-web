"use client";

import "./styles.scss";

import React, { useEffect, useState } from "react";

import useLanguageData from "../../../../data/context/language/useLanguageData";

import { Empty, Upload, UploadFile } from "antd";
import { map } from "lodash";

import { ISale } from "../../../../shared/business/sales/sale.interface";
import {
  getFileUrl,
  isImageFile,
} from "../../../../shared/utils/images/images-helper";
import { getImageUrl } from "../../../../shared/utils/images/images-url";

interface Props {
  sale: ISale | null;
}

export const SaleFilesList: React.FC<Props> = ({ sale }) => {
  const { t } = useLanguageData();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (sale?.filesUrl?.length) {
      const saleFilesUrlToFileList: UploadFile[] = map(
        sale.filesUrl,
        (fileUrl: string, index: number): UploadFile => ({
          uid: `sale-file-${index}`,
          name: fileUrl,
          status: "done",
          url: getImageUrl(fileUrl),
        })
      );

      setFileList(saleFilesUrlToFileList);
    }
  }, [sale]);

  const onPreview = async (file: UploadFile) => {
    const src: string | null = (file.url || (await getFileUrl(file))) as
      | string
      | null;

    const newWindow: Window | null = window.open();

    if (newWindow) {
      newWindow.document.write(
        `<iframe 
            src="${src}" 
            frameborder="0" 
            style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%; position:fixed;"
            allowfullscreen>
          </iframe>`
      );
    }
  };

  if (fileList.length === 0) {
    return (
      <div className="flex flex-col">
        <label>{t("sales.files")}</label>

        <Empty className="mt-2" description={t("sales.noFilesUploaded")} />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <label>{t("sales.files")}</label>

      <div className="mt-2">
        <Upload
          action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
          listType="picture-card"
          fileList={fileList}
          onPreview={onPreview}
          showUploadList={{ showRemoveIcon: false }}
          iconRender={(file) =>
            isImageFile(file) ? (
              <img
                src={getImageUrl(file.name)}
                alt={file.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-4xl">📄</span>
              </div>
            )
          }
        ></Upload>
      </div>
    </div>
  );
};
