"use client";

import { Button, Card, Image, Table, Tooltip } from "antd";
import moment from "moment";
import { useRouter } from "next/navigation";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

import Layout from "../../components/template/Layout/Layout";
import Urls from "../../shared/common/routes-app/routes-app";
import DatesEnum from "../../shared/utils/dates/dates.enum";

export default function MyStores() {
  const router = useRouter();

  const dataSource = Array(2).fill({
    _id: "1",
    name: "Mike",
    tags: ["tag1"],
    logoUrl:
      "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "ACTIVE",
    description: "test any description",
  });

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
            <Button type="primary" onClick={handleNewStore}>
              New store
            </Button>
          </>
        }
      >
        <Table
          dataSource={dataSource}
          columns={[
            {
              title: "Logo",
              dataIndex: "logoUrl",
              key: "logoUrl",
              render: (logoUrl: string) => {
                return (
                  <Image
                    width={60}
                    src={logoUrl}
                    alt="logoUrl"
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
              title: "Tags",
              dataIndex: "tags",
              key: "tags",
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
              title: "Description",
              dataIndex: "description",
              key: "description",
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
            },
            {
              title: "Actions",
              dataIndex: "action",
              key: "action",
              render: (_: any, record: any) => {
                return (
                  <>
                    <Tooltip title="edit store">
                      <Button
                        className="mr-1"
                        type="info"
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
