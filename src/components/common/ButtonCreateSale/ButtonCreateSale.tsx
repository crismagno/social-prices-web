import { Button } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { PlusOutlined } from "@ant-design/icons";

import Urls from "../../../shared/common/routes-app/routes-app";

interface Props {
  storeId?: string;
  customerId?: string;
  productId?: string;
  productItemId?: string;
}

export const ButtonCreateSale: React.FC<Props> = ({
  storeId,
  customerId,
  productId,
  productItemId,
}) => {
  const router: AppRouterInstance = useRouter();

  return (
    <Button
      type="primary"
      onClick={() => {
        if (storeId) {
          router.push(Urls.SALES_CREATE_BY_STORE.replace(":storeId", storeId));
        } else if (customerId) {
          router.push(
            Urls.SALES_CREATE_BY_CUSTOMER.replace(":customerId", customerId)
          );
        } else if (productItemId) {
          router.push(
            Urls.SALES_CREATE_BY_PRODUCT_ITEM.replace(
              ":productItemId",
              productItemId
            )
          );
        } else if (productId) {
          router.push(
            Urls.SALES_CREATE_BY_PRODUCT.replace(":productId", productId)
          );
        } else {
          router.push(Urls.SALES_CREATE);
        }
      }}
      icon={<PlusOutlined />}
    >
      Create Sale
    </Button>
  );
};
