import { Drawer } from "antd";

import { CustomersUpload } from "../CustomersUpload/CustomersUpload";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomersUploadDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  return (
    <Drawer
      title={"Upload Customers"}
      onClose={onClose}
      open={isOpen}
      width={"50%"}
    >
      <CustomersUpload />
    </Drawer>
  );
};
