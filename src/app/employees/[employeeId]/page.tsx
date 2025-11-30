"use client";

import { useState } from "react";

import { Button, Card, Col, Image, Modal, Row, Tag, Tooltip } from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useParams, useRouter } from "next/navigation";

import { EditOutlined, FileOutlined, TagOutlined } from "@ant-design/icons";

import Avatar from "../../../components/common/Avatar/Avatar";
import ContainerTitle from "../../../components/common/ContainerTitle/ContainerTitle";
import Description from "../../../components/common/Description/Description";
import { DescriptionAddresses } from "../../../components/common/DescriptionAddresses/DescriptionAddresses";
import { DescriptionPhoneNumbers } from "../../../components/common/DescriptionPhoneNumbers/DescriptionPhoneNumbers";
import {
  IconAtSymbol,
  IconCake,
  IconIdentification,
  IconPencilSquare,
  IconQuestion,
  IconUser,
} from "../../../components/common/icons/icons";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import { TagTagsCustomAntd } from "../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import Layout from "../../../components/template/Layout/Layout";
import EmployeesEnum from "../../../shared/business/employees/employees.enum";
import PersonEnum from "../../../shared/business/shared/person/person.enum";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import ImagesEnum from "../../../shared/utils/images/images.enum";
import { useFindTagsByType } from "../../tags/useFindTagsByType";
import { useFindEmployeeById } from "../detail/useFindEmployeeById";

export default function EmployeePage() {
  const router: AppRouterInstance = useRouter();

  const params: Params = useParams();

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const paramsEmployeeId: string = params?.employeeId;

  const { isLoading, employee } = useFindEmployeeById(paramsEmployeeId);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.EMPLOYEE
  );

  if (isLoading || !employee || isLoadingTags) {
    return <LoadingFull />;
  }

  const employeeId: string = employee._id;

  const handleEditEmployee = () => {
    router.push(Urls.EDIT_EMPLOYEE.replace(":employeeId", employeeId));
  };

  return (
    <Layout
      subtitle={`Here we can see about employee - ${employee.name}`}
      title="Employee"
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        <Row gutter={[4, 4]}>
          <Col
            xs={24}
            sm={10}
            md={5}
            className="flex flex-col justify-center items-center"
          >
            <Avatar
              onClick={() => setPreviewOpen(true)}
              src={employee.avatar}
              width={240}
              className="shadow-lg border-none cursor-pointer z-10"
              title="See avatar"
            />

            <h3 className="md:text-2xl font-semibold text-blueGray-700 mt-1">
              {employee.name}
            </h3>

            <Tooltip title={"Employee Email, click to send a email"}>
              <a
                href={`mailto:${employee.email}`}
                className="flex items-center text-sm leading-normal text-gray-400 
                  font-bold px-2 py-1 shadow-sm rounded-lg border border-gray-300 mt-1
                  w-min"
              >
                {IconAtSymbol("w-3.5 h-3.5")}
                {employee.email}
              </a>
            </Tooltip>
          </Col>

          <Col xs={24} sm={14} md={19}>
            <ContainerTitle
              title="Information"
              extraHeader={
                <Tooltip title="Edit employee">
                  <Button
                    type="success"
                    icon={<EditOutlined />}
                    onClick={handleEditEmployee}
                  >
                    Edit
                  </Button>
                </Tooltip>
              }
            >
              <Row>
                <Col xs={24} md={12}>
                  <Description
                    label="Name"
                    description={`${employee.name ?? "-"}`}
                    leftIcon={IconUser()}
                  />

                  <Description
                    label="Username"
                    description={`${employee.username ?? "-"}`}
                    leftIcon={IconIdentification()}
                  />

                  <Description
                    label="Email"
                    description={employee.email ?? "-"}
                    leftIcon={IconAtSymbol()}
                  />

                  <Description
                    label="Birth Date"
                    leftIcon={IconCake()}
                    description={
                      employee.birthDate
                        ? moment(employee.birthDate).format(
                            DatesEnum.Format.DDMMYYY
                          )
                        : "-"
                    }
                  />

                  <Description
                    label="Gender"
                    leftIcon={IconQuestion()}
                    description={
                      <Tag
                        color={
                          PersonEnum.GenderColors[
                            employee.gender ?? PersonEnum.Gender.OTHER
                          ]
                        }
                      >
                        {
                          PersonEnum.GenderLabels[
                            employee.gender ?? PersonEnum.Gender.OTHER
                          ]
                        }
                      </Tag>
                    }
                  />

                  <Description
                    label="Level"
                    leftIcon={IconQuestion()}
                    description={
                      <Tag color={EmployeesEnum.LevelColors[employee.level]}>
                        {EmployeesEnum.LevelLabels[employee.level]}
                      </Tag>
                    }
                  />
                </Col>

                <Col xs={24} md={12}>
                  <Description
                    label="Tags"
                    description={
                      <div className="w-full flex">
                        <TagTagsCustomAntd
                          tags={tags}
                          useTag
                          tagsIds={employee.tagsIds}
                        />
                      </div>
                    }
                    leftIcon={<TagOutlined className="text-lg" />}
                  />

                  <DescriptionPhoneNumbers
                    phoneNumbers={employee.phoneNumbers}
                  />

                  <DescriptionAddresses addresses={employee.addresses} />

                  <Description
                    label="About"
                    description={employee.about}
                    leftIcon={IconPencilSquare()}
                  />

                  <Description
                    label="Status"
                    leftIcon={IconQuestion()}
                    description={
                      <Tag color={EmployeesEnum.StatusColors[employee.status]}>
                        {EmployeesEnum.StatusLabels[employee.status]}
                      </Tag>
                    }
                  />
                  <Description
                    label="Upload Filename"
                    description={employee.uploadFilename}
                    leftIcon={<FileOutlined className="text-lg" />}
                  />
                </Col>
              </Row>
            </ContainerTitle>
          </Col>
        </Row>
      </Card>

      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <Image
          alt="preview image"
          style={{ width: "100%" }}
          preview={false}
          src={
            employee?.avatar
              ? getImageUrl(employee.avatar)
              : ImagesEnum.FilesNames.DefaultAvatarImage
          }
        />
      </Modal>
    </Layout>
  );
}
