"use client";

import { useState } from "react";

import { Button, Card, Tag } from "antd";

import { PlusOutlined } from "@ant-design/icons";

import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import { ISale } from "../../shared/business/sales/sale.interface";
import SalesEnum from "../../shared/business/sales/sales.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { useFindSalesByUserTableState } from "./useFindSalesByUserTableState";

export default function SalesPage() {
  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ISale> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, sales, total } =
    useFindSalesByUserTableState(tableStateRequest);

  return (
    <Layout subtitle="Sales information" title="Sales">
      <Card
        title="Sales"
        className="h-min-80 mt-5"
        extra={
          <>
            <Button type="primary" onClick={() => {}} icon={<PlusOutlined />}>
              Create Sale
            </Button>
          </>
        }
      >
        <TableCustomAntd2<ISale>
          rowKey={"_id"}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          dataSource={sales}
          columns={[
            {
              title: "Number",
              dataIndex: "number",
              key: "number",
              align: "center",
            },
            {
              title: "Type",
              dataIndex: "type",
              key: "type",
              align: "center",
              render: (type: SalesEnum.Type) => (
                <Tag color={SalesEnum.TypeColors[type]}>
                  {SalesEnum.TypeLabels[type]}
                </Tag>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              align: "center",
              render: (status: SalesEnum.Status) => (
                <Tag color={SalesEnum.StatusColors[status]}>
                  {SalesEnum.StatusLabels[status]}
                </Tag>
              ),
            },
          ]}
          search={{ placeholder: "Search sales.." }}
          loading={isLoading}
          pagination={{
            total,
          }}
        />
      </Card>
    </Layout>
  );
}
