import { useState } from "react";

import { Button, Card, Col, Drawer, Row, Select, Tag } from "antd";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { DownloadOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import handleClientError from "../../../../components/common/handleClientError/handleClientError";
import { TagTagCustomAntd } from "../../../../components/common/TagTagCustomAntd/TagTagCustomAntd";
import { InputCustomAntd } from "../../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import EmployeesEnum from "../../../../shared/business/employees/employees.enum";
import { IFiltersDownloadEmployees } from "../../../../shared/business/employees/employees.types";
import PersonEnum from "../../../../shared/business/enums/person.enum";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import TableStateEnum from "../../../../shared/utils/table/table-state.enum";

const formSchema = z.object({
  search: z.string().nullable(),
  gender: z.string().nullable(),
  level: z.string().nullable(),
  status: z.string().nullable(),
  tagsIds: z.array(z.string()),
  sortField: z.string().nullable(),
  sortOrder: z.string().nullable(),
});

type TFormSchema = z.infer<typeof formSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  width?: string | number;
  tags: ITag[];
}

export const DownloadEmployeesDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  width = "50%",
  tags = [],
}) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<TFormSchema>({
    values: {
      gender: null,
      search: null,
      level: null,
      status: null,
      tagsIds: [],
      sortField: EmployeesEnum.SortField.createdAt,
      sortOrder: TableStateEnum.SortOrder.ascend,
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    try {
      setIsDownloading(true);

      const response: Buffer =
        await serviceMethodsInstance.employeesServiceMethods.downloadEmployees(
          data as IFiltersDownloadEmployees
        );

      const url: string = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "fileDownloadEmployees.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Drawer title={title} onClose={onClose} open={isOpen} width={width}>
      <Card title="Filters">
        <Row>
          <Col xs={24}>
            <InputCustomAntd
              controller={{ control, name: "search" }}
              label="Search"
              placeholder={"Search employees..."}
              errorMessage={errors.search?.message}
              maxLength={200}
              allowClear
            />
          </Col>

          <Col xs={24} sm={8}>
            <SelectCustomAntd
              controller={{ control, name: "tagsIds" }}
              label="Tags"
              errorMessage={errors.tagsIds?.message}
              placeholder={"Select tags"}
              mode="multiple"
              allowClear
            >
              {tags.map((tag: ITag) => (
                <Select.Option key={tag._id} value={tag._id}>
                  <TagTagCustomAntd tag={tag} useTag={false} />
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={8}>
            <SelectCustomAntd
              controller={{ control, name: "level" }}
              label="Level"
              errorMessage={errors.level?.message}
            >
              <Select.Option key={"SELECT_ALL"} value={null}>
                - Select -
              </Select.Option>
              {Object.keys(EmployeesEnum.Level).map((level: string) => (
                <Select.Option key={level} value={level}>
                  <Tag
                    color={
                      EmployeesEnum.LevelColors[level as EmployeesEnum.Level]
                    }
                  >
                    {EmployeesEnum.LevelLabels[level as EmployeesEnum.Level]}
                  </Tag>
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={8}>
            <SelectCustomAntd
              controller={{ control, name: "status" }}
              label="Status"
              errorMessage={errors.status?.message}
            >
              <Select.Option key={"SELECT_ALL"} value={null}>
                - Select -
              </Select.Option>
              {Object.keys(EmployeesEnum.Status).map((status: string) => (
                <Select.Option key={status} value={status}>
                  {EmployeesEnum.StatusLabels[status as EmployeesEnum.Status]}
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={8}>
            <SelectCustomAntd
              controller={{ control, name: "gender" }}
              label="Gender"
              errorMessage={errors.gender?.message}
            >
              <Select.Option key={"SELECT_ALL"} value={null}>
                - Select -
              </Select.Option>
              {Object.keys(PersonEnum.Gender).map((gender: string) => (
                <Select.Option key={gender} value={gender}>
                  {PersonEnum.GenderLabels[gender as PersonEnum.Gender]}
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={8}>
            <SelectCustomAntd
              controller={{ control, name: "sortField" }}
              label="Sort Field"
              errorMessage={errors.sortField?.message}
              placeholder={"Select sort field"}
            >
              {Object.keys(EmployeesEnum.SortField).map((sortField: string) => (
                <Select.Option key={sortField} value={sortField}>
                  {
                    EmployeesEnum.SortFieldLabels[
                      sortField as EmployeesEnum.SortField
                    ]
                  }
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={8}>
            <SelectCustomAntd
              controller={{ control, name: "sortOrder" }}
              label="Sort Order"
              errorMessage={errors.sortField?.message}
              placeholder={"Select sort order"}
            >
              {Object.keys(TableStateEnum.SortOrder).map(
                (sortOrder: string) => (
                  <Select.Option key={sortOrder} value={sortOrder}>
                    {
                      TableStateEnum.SortOrderLabels[
                        sortOrder as TableStateEnum.SortOrder
                      ]
                    }
                  </Select.Option>
                )
              )}
            </SelectCustomAntd>
          </Col>
        </Row>
      </Card>

      <Button
        type="primary"
        onClick={handleSubmit(onSubmit)}
        icon={<DownloadOutlined />}
        className="mt-3 block w-full"
        loading={isDownloading}
        disabled={isDownloading}
      >
        Download
      </Button>
    </Drawer>
  );
};
