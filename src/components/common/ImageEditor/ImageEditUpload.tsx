"use client";

import { Children, ReactElement, cloneElement } from "react";

import { Upload } from "antd";
import type { RcFile, UploadProps } from "antd/es/upload";

import { TAspect } from "./ImageEditorModal";
import { useImageEditStep } from "./useImageEditStep";

interface Props {
  /** One Ant Design Upload: its pictures pass through the editor first. */
  children: ReactElement<UploadProps>;
  /** The shape the crop starts in. */
  initialAspect?: TAspect;
}

/**
 * Wraps an Upload so every picture picked opens in the image editor before
 * the Upload gets it; the Upload's own checks still run on the edited file.
 */
const ImageEditUpload = ({ children, initialAspect = "1:1" }: Props) => {
  const { editIfImage, editor } = useImageEditStep(initialAspect);

  const upload = Children.only(children);
  const ownCheck = upload.props.beforeUpload;

  const beforeUpload: UploadProps["beforeUpload"] = async (file, fileList) => {
    const edited: File = await editIfImage(file);

    // The Upload knows a file by its uid: the edited one keeps it.
    const result: RcFile =
      edited === file
        ? file
        : Object.assign(edited, { uid: file.uid, lastModifiedDate: new Date() });

    if (ownCheck) {
      const verdict = await ownCheck(result, fileList);

      if (verdict === false || verdict === Upload.LIST_IGNORE) {
        return verdict;
      }

      if (verdict instanceof Blob) {
        return verdict;
      }
    }

    return result;
  };

  return (
    <>
      {cloneElement(upload, { beforeUpload })}
      {editor}
    </>
  );
};

export default ImageEditUpload;
