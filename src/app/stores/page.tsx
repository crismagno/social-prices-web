"use client";

import { Button, Card, Image, Table, Tag, Tooltip } from "antd";
import moment from "moment";
import { useRouter } from "next/navigation";

import { EditOutlined, EnterOutlined, PlusOutlined } from "@ant-design/icons";

import Layout from "../../components/template/Layout/Layout";
import StoresEnum from "../../shared/business/stores/stores.enum";
import { IStore } from "../../shared/business/stores/stores.interface";
import Urls from "../../shared/common/routes-app/routes-app";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { getImageAwsS3 } from "../../shared/utils/images/url-images";
import { useFindStoresByUser } from "./useFindStoresByUser";

export default function MyStores() {
  const router = useRouter();

  const { isLoading, stores } = useFindStoresByUser();

  const logoUrlDefault: string =
    "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png";

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
                      src={logoUrlDefault}
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
                    onError={() => logoUrlDefault}
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
              render: (_: any, record: any) => {
                return (
                  <>
                    <Tooltip title="edit store">
                      <Button
                        className="mr-1"
                        type="warning"
                        onClick={handleEditStore}
                        icon={<EditOutlined />}
                      />
                    </Tooltip>
                    <Tooltip title="Go to store">
                      <Button
                        type="primary"
                        onClick={handleDeleteStore}
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
