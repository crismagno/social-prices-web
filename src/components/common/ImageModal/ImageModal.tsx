import "./styles.scss";

import React, { useEffect, useState } from "react";

import { Modal, Upload } from "antd";
import type { RcFile, UploadProps } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";

import { PlusOutlined } from "@ant-design/icons";

import { getBase64 } from "../../../shared/utils/images/helper";
import { getImageAwsS3 } from "../../../shared/utils/images/url-images";

interface Props {
  isVisible: boolean;
  onCancel: (e?: any) => void;
  onOk: (e: any, fileList: UploadFile[]) => void;
  url?: string | null;
}

const ImageModal: React.FC<Props> = ({ isVisible, onCancel, onOk, url }) => {
  const getDefaultFile = (): UploadFile => {
    const defaultUrl: string = getImageAwsS3(url!);

    return {
      uid: "12345",
      name: "url.png",
      status: "done",
      url: defaultUrl,
    };
  };

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const [previewImage, setPreviewImage] = useState<string>("");

  const [previewTitle, setPreviewTitle] = useState<string>("");

  const [fileList, setFileList] = useState<UploadFile[]>(
    url ? [getDefaultFile()] : []
  );

  useEffect(() => {
    if (url) {
      setFileList([getDefaultFile()]);
    } else {
      setFileList([]);
    }
  }, [url]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Modal
      zIndex={10000}
      open={isVisible}
      onCancel={() => {
        setFileList(url ? [getDefaultFile()] : []);
        onCancel();
      }}
      onOk={(e) => onOk(e, fileList)}
      destroyOnClose
    >
      <div className="content-edit-modal">
        <Upload
          action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
          listType="picture-circle"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          className="avatar-uploader"
          style={{ width: 100 }}
        >
          {fileList.length === 1 ? null : uploadButton}
        </Upload>
      </div>

      <Modal
        zIndex={10000}
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="preview image" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </Modal>
  );
};

export default ImageModal;
