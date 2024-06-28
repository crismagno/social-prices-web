import { Button } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { PlusOutlined } from "@ant-design/icons";

import Urls from "../../../shared/common/routes-app/routes-app";

export const ButtonCreateSale: React.FC = () => {
  const router: AppRouterInstance = useRouter();

  return (
    <Button
      type="primary"
      onClick={() => router.push(Urls.SALES_CREATE)}
      icon={<PlusOutlined />}
    >
      Create Sale
    </Button>
  );
};
