"use client";

import { useState } from "react";

import { Button, Card, Tag, Tooltip } from "antd";
import moment from "moment";

import { EditOutlined, PlusOutlined, TagFilled } from "@ant-design/icons";

import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import useLanguageData from "../../data/context/language/useLanguageData";
import TagsEnum from "../../shared/business/tags/tags.enum";
import { ITag } from "../../shared/business/tags/tags.interface";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { TagDetailDrawer } from "./components/TagDetailDrawer/TagDetailDrawer";
import { useFindTagsByUserTableState } from "./useFindTagsByUserTableState";

export default function TagsPage() {
  const { t } = useLanguageData();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ITag> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, tags, total, fetchFindTagsByUserTableState } =
    useFindTagsByUserTableState(tableStateRequest);

  const [isTagDetailDrawerOpen, setIsTagDetailDrawerOpen] =
    useState<boolean>(false);

  const [tagId, setTagId] = useState<string | undefined>();

  return (
    <Layout subtitle={t("tags.myTags")} title={t("tags.title")} hasBackButton>
      <Card
        title={t("tags.title")}
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
            {t("tags.newTag")}
          </Button>
        }
      >
        <TableCustomAntd2<ITag>
          rowKey={"_id"}
          dataSource={tags}
          columns={[
            {
              title: t("common.name"),
              dataIndex: "name",
              key: "name",
              align: "center",
            },
            {
              title: t("tags.color"),
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
              title: t("common.description"),
              dataIndex: "description",
              key: "description",
              align: "center",
            },
            {
              title: t("tags.type"),
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
              title: t("tags.createdAt"),
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: t("tags.updatedAt"),
              dataIndex: "updatedAt",
              key: "updatedAt",
              align: "center",
              render: (updatedAt: Date) =>
                moment(updatedAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: t("tags.action"),
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (_: any, tag: ITag) => (
                <Tooltip title={t("tags.editTagTooltip")}>
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
          search={{ placeholder: t("tags.searchTags") }}
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
