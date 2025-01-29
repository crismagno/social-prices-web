import { forwardRef, useImperativeHandle, useState } from "react";

import { Button, Card, Tag, Tooltip } from "antd";
import moment from "moment";

import { DownloadOutlined } from "@ant-design/icons";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
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

    const [downloadingErrors, setDownloadingErrors] = useState<{
      fileUploadId: string;
      isDownloading: boolean;
    } | null>(null);

    const {
      isLoading,
      filesUploads,
      fetchFindFilesUploadsByUserTableState,
      total,
    } = useFindFilesUploadsByUserTableState(tableStateRequest);

    useImperativeHandle(ref, () => ({
      fetchFindFilesUploadsByUserTableState,
    }));

    const handleDownloadErrors = async (
      fileUploadId: string
    ): Promise<void> => {
      try {
        setDownloadingErrors({ fileUploadId, isDownloading: true });

        const response: Buffer =
          await serviceMethodsInstance.filesUploadsServiceMethods.downloadErrors(
            fileUploadId
          );

        const url: string = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "fileUploadErrors.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error: any) {
        handleClientError(error);
      } finally {
        setDownloadingErrors(null);
      }
    };

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
                if (fileUpload.status === FilesUploadsEnum.Status.ERROR) {
                  const fileUploadId: string = fileUpload._id;

                  return (
                    <Button.Group>
                      <Tooltip title="Download Errors">
                        <Button
                          type="danger"
                          disabled={
                            downloadingErrors?.isDownloading &&
                            downloadingErrors.fileUploadId !== fileUploadId
                          }
                          loading={
                            downloadingErrors?.isDownloading &&
                            downloadingErrors.fileUploadId === fileUploadId
                          }
                          onClick={() => handleDownloadErrors(fileUploadId)}
                          icon={<DownloadOutlined />}
                        />
                      </Tooltip>
                    </Button.Group>
                  );
                }

                return null;
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
