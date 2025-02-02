import { Drawer } from "antd";

import { IEmployee } from "../../../../shared/business/employees/employee.interface";
import { EmployeeEdit } from "../EmployeeEdit/EmployeeEdit";

interface Props {
  isOpen: boolean;
  onCancel: (employee: IEmployee | null) => void;
  onSave: (employee: IEmployee) => void;
  title?: string;
  width?: string | number;
  employeeId: string | null;
}

export const EmployeeEditDrawer: React.FC<Props> = ({
  isOpen,
  onSave,
  title,
  width = "50%",
  employeeId,
  onCancel,
}) => {
  return (
    <Drawer title={title} onClose={onCancel} open={isOpen} width={width}>
      <EmployeeEdit
        employeeId={employeeId}
        onCancel={onCancel}
        onSave={onSave}
      />
    </Drawer>
  );
};
