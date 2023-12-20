"use client";

import { Button, Card, Image, Table } from "antd";
import moment from "moment";

import Layout from "../../components/template/Layout/Layout";
import DatesEnum from "../../shared/utils/dates/dates.enum";

export default function MyStores() {
  const dataSource = [
    {
      key: "1",
      name: "Mike",
      tags: ["tag1"],
      logo: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      key: "1",
      name: "Mike",
      tags: ["tag1"],
      logo: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      key: "1",
      name: "Mike",
      tags: ["tag1"],
      logo: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return (
    <Layout subtitle="My Stores" title="Stores">
      <Card
        className="h-min-80 mt-5"
        extra={
          <>
            <Button>New store</Button>
          </>
        }
      >
        <Table
          dataSource={dataSource}
          columns={[
            {
              title: "Logo",
              dataIndex: "logo",
              key: "logo",
              render: (logo: string) => {
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
          ]}
        />
      </Card>
    </Layout>
  );
}
