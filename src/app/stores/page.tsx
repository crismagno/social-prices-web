"use client";

import { Button, Card, Image, TablePaginationConfig, Tag, Tooltip } from "antd";
import {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from "antd/es/table/interface";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";
import { RecordType } from "zod";

import { EditOutlined, EnterOutlined, PlusOutlined } from "@ant-design/icons";

import TableAntdCustom from "../../components/custom/antd/TableAntdCustom/TableAntdCustom";
import Layout from "../../components/template/Layout/Layout";
import StoresEnum from "../../shared/business/stores/stores.enum";
import { IStore } from "../../shared/business/stores/stores.interface";
import Urls from "../../shared/common/routes-app/routes-app";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { defaultAvatarImage } from "../../shared/utils/images/files-names";
import { getImageAwsS3 } from "../../shared/utils/images/url-images";
import { StoreDetail } from "./components/StoreDetail/StoreDetail";
import { useFindStoresByUserTableState } from "./useFindStoresByUserTableState";

export default function Stores() {
  const router: AppRouterInstance = useRouter();

  const { isLoading, stores, fetchFindStoresByUserTableState, total } =
    useFindStoresByUserTableState();

  const handleNewStore = () => {
    router.push(Urls.NEW_STORE);
  };

  const handleEditStore = (store: IStore) => {
    router.push(Urls.EDIT_STORE.replace(":storeId", store._id));
  };

  const handleGotToStore = (store: IStore) => {
    router.push(Urls.STORE_PRODUCTS.replace(":storeId", store._id));
  };

  const onSearch = (value: string) => {
    fetchFindStoresByUserTableState({ search: value?.trim() });
  };

  const handleChangeTable = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<RecordType> | SorterResult<RecordType>[],
    extra: TableCurrentDataSource<RecordType>
  ) => {
    console.log("pagination: ", pagination);
    console.log("filters: ", filters);
    console.log("sorter: ", sorter);
    console.log("extra: ", extra);
  };

  return (
    <Layout subtitle="My Stores" title="Stores">
      <Card
        title="Stores"
        className="h-min-80 mt-5"
        extra={
          <>
            <Button
              type="primary"
              onClick={handleNewStore}
              icon={<PlusOutlined />}
            >
              New Store
            </Button>
          </>
        }
      >
        <TableAntdCustom<IStore>
          rowKey={"_id"}
          onChange={handleChangeTable}
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
                  <Tooltip title="See logo">
                    <Image
                      width={50}
                      height={50}
                      src={getImageAwsS3(logo)}
                      alt="logo"
                      className="rounded-full"
                    />
                  </Tooltip>
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
                    <Tooltip title="Edit store">
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
          search={{ onSearch, placeholder: "Search stores.." }}
          loading={isLoading}
          expandable={{
            expandedRowRender: (store: IStore) => <StoreDetail store={store} />,
          }}
          pagination={{
            total,
          }}
        />
      </Card>
    </Layout>
  );
}
