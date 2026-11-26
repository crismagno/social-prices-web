import "./styles.scss";

import React, { useEffect, useState } from "react";

import { Upload, UploadFile, UploadProps } from "antd";
import { map } from "lodash";

import ImageEditUpload from "../../../../../components/common/ImageEditor/ImageEditUpload";
import useLanguageData from "../../../../../data/context/language/useLanguageData";
import { ISale } from "../../../../../shared/business/sales/sale.interface";
import FilesEnum from "../../../../../shared/utils/files/files.enum";
import {
  getFileUrl,
  isImageFile,
} from "../../../../../shared/utils/images/images-helper";
import { getImageUrl } from "../../../../../shared/utils/images/images-url";
import ImagesEnum from "../../../../../shared/utils/images/images.enum";

interface Props {
  sale: ISale | null;
  onSetFileList: (newFileList: UploadFile[]) => void;
}

export const AddSaleFiles: React.FC<Props> = ({ sale, onSetFileList }) => {
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
        }),
      );

      setFileList(saleFilesUrlToFileList);
      onSetFileList(saleFilesUrlToFileList);
    } else {
      setFileList([]);
      onSetFileList([]);
    }
  }, [sale?.filesUrl]);

  const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    onSetFileList(newFileList);
  };

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
          </iframe>`,
      );
    }
  };

  return (
    <div className="flex flex-col">
      <label>{t("sales.files")}</label>

      <div className="mt-2">
        <ImageEditUpload initialAspect="free">
        <Upload
          action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
          accept={FilesEnum.AcceptFileType}
          listType="picture-card"
          fileList={fileList}
          onChange={onChange}
          onPreview={onPreview}
          multiple={true}
          iconRender={(file) =>
            isImageFile(file) ? (
              <img
                src={getImageUrl(file.name)}
                alt={file.name}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src =
                    ImagesEnum.FilesNames.DefaultSaleImage;
                }}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-4xl">📄</span>
              </div>
            )
          }
        >
          {fileList.length < 10 && `+ ${t("common.upload")}`}
        </Upload>
        </ImageEditUpload>
      </div>
    </div>
  );
};
