import { Drawer } from 'antd';

import {
  UploadFiles,
  UploadFilesProps,
} from '../UploadFiles/UploadFiles';

interface Props extends UploadFilesProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  width?: string | number;
  children?: any;
}

export const UploadFilesDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  width = "50%",
  onUploadFiles,
  accept,
  downloadFileName,
  maxFilesToUpload,
  children,
  useProduct = false,
}) => {
  return (
    <Drawer title={title} onClose={onClose} open={isOpen} width={width}>
      <UploadFiles
        onUploadFiles={onUploadFiles}
        downloadFileName={downloadFileName}
        accept={accept}
        maxFilesToUpload={maxFilesToUpload}
        useProduct={useProduct}
      />
      {children}
    </Drawer>
  );
};
