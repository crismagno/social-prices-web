"use client";

import { useState } from 'react';

import {
  Button,
  Divider,
  message,
  Upload,
  UploadFile,
} from 'antd';
import { RcFile } from 'antd/es/upload';

import {
  InboxOutlined,
  UploadOutlined,
} from '@ant-design/icons';

import { IProduct } from '../../../shared/business/products/products.interface';
import { DownloadFile } from '../DownloadFile/DownloadFile';
import handleClientError from '../handleClientError/handleClientError';
import SelectProduct from '../SelectProduct/SelectProduct';

const { Dragger } = Upload;

export interface UploadFilesProps {
  maxFilesToUpload?: number;
  downloadFileName?: string;
  accept?: string;
  onUploadFiles: (formData: FormData) => Promise<any> | any | void;
  useProduct?: boolean;
}

export const UploadFiles: React.FC<UploadFilesProps> = ({
  maxFilesToUpload = 5,
  downloadFileName,
  accept,
  onUploadFiles,
  useProduct = false,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [selectedProductId, setSelectedProductId] = useState<string | string>();

  const handleUpload = async () => {
    try {
      if (useProduct && !selectedProductId) {
        message.error("Please select a product before upload files!");
        return;
      }

      setIsUploading(true);

      const formData = new FormData();

      if (useProduct && selectedProductId) {
        formData.append("productId", selectedProductId);
      }

      for (var i = 0; i < fileList.length; i++) {
        formData.append("files", fileList[i] as RcFile);
      }

      await onUploadFiles?.(formData);

      message.info(
        "Your files are been processed! We will send a notification when ready, or any information related to process."
      );

      setFileList([]);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsUploading(false);
    }
  };

  const onRemoveUpload = (file: UploadFile<any>) => {
    const index: number = fileList.indexOf(file);
    const newFileList: UploadFile<any>[] = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };

  const onBeforeUpload = (_: RcFile, files: RcFile[]) => {
    if (fileList.length + files.length > maxFilesToUpload) {
      message.error(
        `Max bulk files to upload reached. Max ${maxFilesToUpload} files!`
      );
      return;
    }

    setFileList([...fileList, ...files]);

    return false;
  };

  return (
    <div>
      <div className="flex justify-between">
        {downloadFileName && (
          <DownloadFile
            filename={downloadFileName}
            btnProps={{
              className: "my-1",
              type: "success",
            }}
            btnLabel="Download Template File"
          />
        )}

        {useProduct && (
          <div className="w-96 my-1">
            <SelectProduct
              disabled={isUploading}
              selectedProductId={selectedProductId}
              onSelectProduct={(selectProduct: IProduct | null) =>
                setSelectedProductId(selectProduct?._id)
              }
            />
          </div>
        )}
      </div>

      <Divider className="my-2" />

      <div className="w-full flex flex-col justify-center items-center">
        <Dragger
          className="w-full"
          multiple
          accept={accept}
          onRemove={onRemoveUpload}
          beforeUpload={onBeforeUpload}
          fileList={fileList}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint px-5">
            Support for a single or bulk upload. Strictly prohibited from
            uploading company data or other banned files.
          </p>
        </Dragger>

        <Button
          type="primary"
          className="w-full mt-4"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={isUploading}
          icon={<UploadOutlined />}
        >
          {isUploading ? "Uploading" : "Start Upload"}
        </Button>
      </div>
    </div>
  );
};
