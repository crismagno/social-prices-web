import { Drawer } from "antd";

import { UploadFiles } from "../../../../components/common/UploadFiles/UploadFiles";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/ServiceMethods";

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
      <UploadFiles
        onUploadFiles={async (formData: FormData) =>
          await serviceMethodsInstance.customersServiceMethods.uploadCustomers(
            formData
          )
        }
        downloadFileName="social-prices-customers-template.xlsx"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      />
    </Drawer>
  );
};
