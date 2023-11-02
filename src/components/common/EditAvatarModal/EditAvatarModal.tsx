import "./styles.scss";

import React, { useState } from "react";

import { Button, message, Modal, Upload } from "antd";
import type { RcFile, UploadProps } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";

import { PlusOutlined, UploadOutlined } from "@ant-design/icons";

import useAuthData from "../../../data/hook/useAuthData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/ServiceMethods";
import IUser from "../../../shared/business/users/user.interface";
import handleClientError from "../handleClientError/handleClientError";

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

interface Props {
  isVisible: boolean;
  onCancel: (e?: any) => void;
  onOk: (e?: any) => void;
}

const EditAvatarModal: React.FC<Props> = ({ isVisible, onCancel, onOk }) => {
  const { updateUserSession } = useAuthData();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const [previewImage, setPreviewImage] = useState<string>("");

  const [previewTitle, setPreviewTitle] = useState<string>("");

  const [fileList, setFileList] = useState<UploadFile[]>([]);

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

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const handleSubmit = async (e: any) => {
    if (fileList.length === 0) {
      message.error("Please select a image to avatar.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();

    formData.append("avatar", fileList[0].originFileObj as RcFile);

    try {
      const response: IUser =
        await serviceMethodsInstance.usersServiceMethods.uploadAvatar(formData);

      updateUserSession(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
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
      onCancel={onCancel}
      onOk={onOk}
      okButtonProps={{ hidden: true, disabled: isSubmitting }}
      cancelButtonProps={{ hidden: true, disabled: isSubmitting }}
      closable={!isSubmitting}
    >
      <div className="content-edit-avatar-modal">
        <Upload
          action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
          listType="picture-circle"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          className="avatar-uploader"
          style={{ width: 100 }}
          disabled={isSubmitting}
        >
          {fileList.length === 1 ? null : uploadButton}
        </Upload>

        <Button
          onClick={handleSubmit}
          className="flex justify-center items-center mt-10"
          loading={isSubmitting}
        >
          <UploadOutlined />
          Upload Avatar
        </Button>
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

export default EditAvatarModal;
