"use client";

import { Button, Card } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useParams, useRouter } from "next/navigation";

import { EditOutlined } from "@ant-design/icons";

import Description from "../../../components/common/Description/Description";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import Layout from "../../../components/template/Layout/Layout";
import Urls from "../../../shared/common/routes-app/routes-app";
import { useFindStoreById } from "../detail/useFindStoreById";

export default function Store() {
  const router: AppRouterInstance = useRouter();

  const params: Params = useParams();

  const { isLoadingStore, store } = useFindStoreById(params?.storeId);

  const handleEditStore = () => {
    router.push(Urls.EDIT_STORE.replace(":storeId", params?.storeId));
  };

  if (isLoadingStore || !store) {
    return <LoadingFull />;
  }

  return (
    <Layout
      subtitle={`Here we can see about store - ${store.name}`}
      title="Store"
      hasBackButton
    >
      <Card
        title="Store"
        className="h-min-80 mt-5"
        extra={
          <>
            <Button
              type="success"
              onClick={handleEditStore}
              icon={<EditOutlined />}
            >
              Edit
            </Button>
          </>
        }
      >
        <Description label="Name" description={store.name} />
      </Card>
    </Layout>
  );
}
