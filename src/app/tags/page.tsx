"use client";

import { useState } from "react";

import { Button, Card, Tag, Tooltip } from "antd";
import moment from "moment";

import { EditOutlined, PlusOutlined, TagFilled } from "@ant-design/icons";

import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import useAuthData from "../../data/context/auth/useAuthData";
import TagsEnum from "../../shared/business/tags/tags.enum";
import { ITag } from "../../shared/business/tags/tags.interface";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { TagDetailDrawer } from "./components/TagDetailDrawer/TagDetailDrawer";
import { useFindTagsByUserTableState } from "./useFindTagsByUserTableState";

export default function TagsPage() {
  const { user } = useAuthData();

  const userId: string = user?._id ?? "";

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ITag> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, tags, total, fetchFindTagsByUserTableState } =
    useFindTagsByUserTableState(userId, tableStateRequest);

  const [isTagDetailDrawerOpen, setIsTagDetailDrawerOpen] =
    useState<boolean>(false);

  const [tagId, setTagId] = useState<string | undefined>();

  return (
    <Layout subtitle="My Tags" title="Tags" hasBackButton>
      <Card
        title="Tags"
        className="h-min-80 mt-5"
        extra={
          <Button
            type="primary"
            onClick={() => {
              setTagId(undefined);
              setIsTagDetailDrawerOpen(true);
            }}
            icon={<PlusOutlined />}
          >
            New Tag
          </Button>
        }
      >
        <TableCustomAntd2<ITag>
          rowKey={"_id"}
          dataSource={tags}
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              align: "center",
            },
            {
              title: "Color",
              dataIndex: "color",
              key: "color",
              align: "center",
              render: (color: string | null) => (
                <TagFilled
                  style={{
                    color: color ?? TagsEnum.defaultTagColor,
                    fontSize: TagsEnum.defaultTagSize,
                  }}
                />
              ),
            },
            {
              title: "Description",
              dataIndex: "description",
              key: "description",
              align: "center",
            },
            {
              title: "Type",
              dataIndex: "type",
              key: "type",
              align: "center",
              filters: Object.keys(TagsEnum.Type).map((type: string) => ({
                text: TagsEnum.TypeLabels[type as TagsEnum.Type],
                value: type,
              })),
              render: (type: TagsEnum.Type) => (
                <Tag>{TagsEnum.TypeLabels[type]}</Tag>
              ),
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
              title: "Action",
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (_: any, tag: ITag) => (
                <Tooltip title="Edit tag">
                  <Button
                    className="mr-1"
                    type="success"
                    onClick={() => {
                      setTagId(tag._id);
                      setIsTagDetailDrawerOpen(true);
                    }}
                    icon={<EditOutlined />}
                  />
                </Tooltip>
              ),
            },
          ]}
          search={{ placeholder: "Search tags..." }}
          loading={isLoading}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          total={total}
        />

        <TagDetailDrawer
          isOpen={isTagDetailDrawerOpen}
          tagId={tagId}
          onClose={() => {
            setTagId(undefined);
            setIsTagDetailDrawerOpen(false);
          }}
          onOk={() => {
            setTagId(undefined);
            setIsTagDetailDrawerOpen(false);
            fetchFindTagsByUserTableState();
          }}
        />
      </Card>
    </Layout>
  );
}
