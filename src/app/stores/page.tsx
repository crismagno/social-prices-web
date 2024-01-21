"use client";

import { Button, Card, Image, Table, Tag, Tooltip } from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { EditOutlined, EnterOutlined, PlusOutlined } from "@ant-design/icons";

import Layout from "../../components/template/Layout/Layout";
import StoresEnum from "../../shared/business/stores/stores.enum";
import { IStore } from "../../shared/business/stores/stores.interface";
import Urls from "../../shared/common/routes-app/routes-app";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { defaultAvatarImage } from "../../shared/utils/images/files-names";
import { getImageAwsS3 } from "../../shared/utils/images/url-images";
import { useFindStoresByUser } from "./useFindStoresByUser";

export default function MyStores() {
  const router: AppRouterInstance = useRouter();

  const { isLoading, stores } = useFindStoresByUser();

  const handleNewStore = () => {
    router.push(Urls.NEW_STORE);
  };

  const handleEditStore = (store: IStore) => {
    router.push(Urls.EDIT_STORE.replace(":storeId", store._id));
  };

  const handleGotToStore = (store: IStore) => {
    alert("go to store...");
  };

  return (
    <Layout subtitle="My Stores" title="Stores">
      <Card
        className="h-min-80 mt-5"
        extra={
          <>
            <Button
              type="primary"
              onClick={handleNewStore}
              icon={<PlusOutlined />}
            >
              New store
            </Button>
          </>
        }
      >
        <Table<IStore>
          rowKey={"_id"}
          onChange={(e) => console.log(e)}
          dataSource={stores}
          columns={[
            {
              title: "#",
              dataIndex: "logo",
              key: "logo",
              align: "center",
              render: (logo: string) => {
                if (!logo) {
                  return (
                    <Image
                      width={50}
                      height={50}
                      src={defaultAvatarImage}
                      alt="logo"
                      className="rounded-full"
                    />
                  );
                }

                return (
                  <Image
                    width={50}
                    height={50}
                    src={getImageAwsS3(logo)}
                    alt="logo"
                    className="rounded-full"
                  />
                );
              },
            },
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              align: "center",
            },
            {
              title: "Email",
              dataIndex: "email",
              key: "email",
              align: "center",
            },
            {
              title: "Created At",
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: "Updated At",
              dataIndex: "updatedAt",
              key: "updatedAt",
              align: "center",
              render: (updatedAt: Date) =>
                moment(updatedAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              align: "center",
              render: (status: StoresEnum.Status) => (
                <Tag color={StoresEnum.StatusColor[status]}>
                  {StoresEnum.StatusLabel[status]}
                </Tag>
              ),
            },
            {
              title: "Action",
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (_: any, store: IStore) => {
                return (
                  <>
                    <Tooltip title="edit store">
                      <Button
                        className="mr-1"
                        type="warning"
                        onClick={() => handleEditStore(store)}
                        icon={<EditOutlined />}
                      />
                    </Tooltip>
                    <Tooltip title="Go to store">
                      <Button
                        type="primary"
                        onClick={() => handleGotToStore(store)}
                        icon={<EnterOutlined />}
                      />
                    </Tooltip>
                  </>
                );
              },
            },
          ]}
          loading={isLoading}
        />
      </Card>
    </Layout>
  );
}
