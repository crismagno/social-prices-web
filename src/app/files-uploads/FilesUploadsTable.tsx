import { forwardRef, useImperativeHandle, useState } from "react";

import { Button, Card, Tag, Tooltip } from "antd";
import moment from "moment";

import { DownloadOutlined } from "@ant-design/icons";

import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import { IFileUpload } from "../../shared/business/files-uploads/file-upload.interface";
import FilesUploadsEnum from "../../shared/business/files-uploads/files-uploads.enum";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { useFindFilesUploadsByUserTableState } from "./useFindFilesUPloadsByUserTableState";

export interface IFilesUploadsTableRefProps {
  fetchFindFilesUploadsByUserTableState: () => Promise<void> | void;
}

interface Props {
  type: FilesUploadsEnum.Type | null;
}

// eslint-disable-next-line react/display-name
export const FilesUploadsTable = forwardRef<IFilesUploadsTableRefProps, Props>(
  ({ type }, ref) => {
    const [tableStateRequest, setTableStateRequest] = useState<
      ITableStateRequest<IFileUpload> | undefined
    >(
      createTableState({
        sort: { field: "createdAt", order: "ascend" },
        filters: type && { type: [type] },
      })
    );

    const {
      isLoading,
      filesUploads,
      fetchFindFilesUploadsByUserTableState,
      total,
    } = useFindFilesUploadsByUserTableState(tableStateRequest);

    useImperativeHandle(ref, () => ({
      fetchFindFilesUploadsByUserTableState,
    }));

    return (
      <Card title="Files Uploads" className="h-min-80 mt-5">
        <TableCustomAntd2<IFileUpload>
          rowKey={"_id"}
          dataSource={filesUploads}
          columns={[
            {
              title: "Filename",
              dataIndex: "filename",
              key: "filename",
              align: "center",
            },
            {
              title: "Type",
              dataIndex: "type",
              key: "type",
              align: "center",
              render: (type: FilesUploadsEnum.Type) => (
                <Tag>{FilesUploadsEnum.TypeLabels[type]}</Tag>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              align: "center",
              filters: Object.keys(FilesUploadsEnum.Status).map(
                (status: string) => ({
                  text: FilesUploadsEnum.StatusLabels[
                    status as FilesUploadsEnum.Status
                  ],
                  value: status,
                })
              ),
              render: (status: FilesUploadsEnum.Status) => (
                <Tag color={FilesUploadsEnum.StatusColors[status]}>
                  {FilesUploadsEnum.StatusLabels[status]}
                </Tag>
              ),
            },
            {
              title: "Created At",
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              sorter: true,
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYY),
            },
            {
              title: "Total To Process",
              dataIndex: "totalToProcess",
              key: "totalToProcess",
              align: "center",
            },
            {
              title: "Total Success",
              dataIndex: "totalSuccess",
              key: "totalSuccess",
              align: "center",
            },
            {
              title: "Total Error",
              dataIndex: "totalError",
              key: "totalError",
              align: "center",
            },
            {
              title: "Total Processed",
              dataIndex: "totalProcessed",
              key: "totalProcessed",
              align: "center",
            },
            {
              title: "Action",
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (_: any, fileUpload: IFileUpload) => {
                return (
                  fileUpload.errors && (
                    <Button.Group>
                      <Tooltip title="Download Errors">
                        <Button
                          type="default"
                          onClick={() => alert("download errors....")}
                          icon={<DownloadOutlined />}
                        />
                      </Tooltip>
                    </Button.Group>
                  )
                );
              },
            },
          ]}
          search={{ placeholder: "Search files uploads..." }}
          loading={isLoading}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          total={total}
          className="overflow-auto"
        />
      </Card>
    );
  }
);
