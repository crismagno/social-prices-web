import { RcFile, UploadFile } from "antd/es/upload";
import { includes } from "lodash";

import FilesEnum from "../files/files.enum";

export const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const getFileUrl = async (file: UploadFile): Promise<string | null> => {
  if (!file) {
    return null;
  }

  if (!file.url && !file.preview) {
    file.preview = await getBase64(file.originFileObj as RcFile);
  }

  return file.url || (file.preview as string);
};

export const isImageFile = (file: UploadFile): boolean => {
  const fileName = file.name || file.fileName || "";

  if (fileName) {
    const extension: string | undefined = fileName
      .split(".")
      .pop()
      ?.toLowerCase();

    return !!extension && includes(FilesEnum.ImageExtensions, extension);
  }

  return false;
};
