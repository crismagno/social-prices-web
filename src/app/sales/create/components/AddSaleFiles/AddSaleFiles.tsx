import React, { useEffect, useState } from "react";

import { Modal, Upload, UploadFile, UploadProps } from "antd";
import { map } from "lodash";

import { ISale } from "../../../../../shared/business/sales/sale.interface";
import FilesEnum from "../../../../../shared/utils/files/files.enum";
import {
  getFileUrl,
  isImageFile,
} from "../../../../../shared/utils/images/helper";
import { getImageUrl } from "../../../../../shared/utils/images/url-images";

interface Props {
  sale: ISale | null;
  onSetFileList: (newFileList: UploadFile[]) => void;
}

export const AddSaleFiles: React.FC<Props> = ({ sale, onSetFileList }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const [previewFile, setPreviewFile] = useState<any | null>(null);

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
      onSetFileList(saleFilesUrlToFileList);
    }
  }, [sale]);

  const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    onSetFileList(newFileList);
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string | null;

    if (!src) {
      src = await getFileUrl(file);
    }

    file.src = src;

    if (isImageFile(file)) {
      setPreviewFile(file);
      setPreviewOpen(true);
      return;
    }

    window.open(file.src, "_blank");
  };

  return (
    <div className="flex flex-col">
      <label>Files</label>

      <div className="mt-2">
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
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-4xl">📄</span>
              </div>
            )
          }
        >
          {fileList.length < 10 && "+ Upload"}
        </Upload>

        <Modal
          open={previewOpen}
          footer={
            <div className="mt-2 text-center w-full">
              {previewFile?.name || previewFile?.fileName || ""}
            </div>
          }
          onCancel={() => {
            setPreviewOpen(false);
            setPreviewFile(null);
          }}
        >
          <img
            alt="preview file"
            style={{ width: "100%" }}
            src={previewFile?.src}
          />
        </Modal>
      </div>
    </div>
  );
};
