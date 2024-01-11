"use client";

import { Button, Card, Image, Table, Tooltip } from "antd";
import moment from "moment";
import { useRouter } from "next/navigation";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

import Layout from "../../components/template/Layout/Layout";
import { IStore } from "../../shared/business/stores/stores.interface";
import Urls from "../../shared/common/routes-app/routes-app";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { useFindStoresByUser } from "./useFindStoresByUser";

export default function MyStores() {
  const router = useRouter();

  const { isLoading, stores } = useFindStoresByUser();

  const handleNewStore = () => {
    router.push(Urls.NEW_STORE);
  };

  const handleEditStore = () => {
    router.push(Urls.EDIT_STORE);
  };

  const handleDeleteStore = () => {
    router.push(Urls.DELETE_STORE);
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
          dataSource={stores}
          columns={[
            {
              title: "",
              dataIndex: "logo",
              key: "logo",
              render: (logo: string) => {
                if (!logo) {
                  return "";
                }

                return (
                  <Image
                    width={60}
                    src={logo}
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
            },
            {
              title: "Email",
              dataIndex: "email",
              key: "email",
            },
            {
              title: "Description",
              dataIndex: "description",
              key: "description",
            },
            {
              title: "Created At",
              dataIndex: "createdAt",
              key: "createdAt",
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
            },
            {
              title: "Updated At",
              dataIndex: "updatedAt",
              key: "updatedAt",
              render: (updatedAt: Date) =>
                moment(updatedAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
            },
            {
              title: "Action",
              dataIndex: "action",
              key: "action",
              render: (_: any, record: any) => {
                return (
                  <>
                    <Tooltip title="edit store">
                      <Button
                        className="mr-1"
                        type="primary"
                        onClick={handleEditStore}
                        icon={<EditOutlined />}
                      />
                    </Tooltip>
                    <Tooltip title="delete store">
                      <Button
                        type="danger"
                        onClick={handleDeleteStore}
                        icon={<DeleteOutlined />}
                      />
                    </Tooltip>
                  </>
                );
              },
            },
          ]}
        />
      </Card>
    </Layout>
  );
}
