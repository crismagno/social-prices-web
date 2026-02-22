"use client";

import {
  lazy,
  Suspense,
  useState,
} from 'react';

import {
  Button,
  Card,
  Col,
  Descriptions,
  Image,
  Row,
  Spin,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import moment from 'moment';
import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import {
  useParams,
  useRouter,
} from 'next/navigation';

import { EditOutlined } from '@ant-design/icons';

import Avatar from '../../../components/common/Avatar/Avatar';
import ContainerTitle
  from '../../../components/common/ContainerTitle/ContainerTitle';
import LoadingFull from '../../../components/common/LoadingFull/LoadingFull';
import {
  TagTagsCustomAntd,
} from '../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd';
import Layout from '../../../components/template/Layout/Layout';
import EmployeesEnum from '../../../shared/business/employees/employees.enum';
import AddressEnum from '../../../shared/business/shared/address/address.enum';
import {
  IAddress,
} from '../../../shared/business/shared/address/address.interface';
import PersonEnum from '../../../shared/business/shared/person/person.enum';
import PhoneNumberEnum
  from '../../../shared/business/shared/phone/phone-number.enum';
import {
  IPhoneNumber,
} from '../../../shared/business/shared/phone/phone-number.interface';
import TagsEnum from '../../../shared/business/tags/tags.enum';
import Urls from '../../../shared/common/routes-app/routes-app';
import DatesEnum from '../../../shared/utils/dates/dates.enum';
import { getImageUrl } from '../../../shared/utils/images/images-url';
import ImagesEnum from '../../../shared/utils/images/images.enum';
import { useFindTagsByType } from '../../tags/useFindTagsByType';
import { useFindEmployeeById } from '../detail/useFindEmployeeById';

// Lazy load dos componentes pesados com named exports
const Modal = lazy(() =>
  import("antd").then((module) => ({ default: module.Modal }))
);
const SalesBalance = lazy(() =>
  import("../../sales/components/SalesBalance/SalesBalance").then((m) => ({
    default: m.SalesBalance,
  }))
);
const SalesChart = lazy(() =>
  import("../../sales/components/SalesChart/SalesChart").then((m) => ({
    default: m.SalesChart,
  }))
);
const SalesChartsStatistics = lazy(() =>
  import(
    "../../sales/components/SalesChartsStatistics/SalesChartsStatistics"
  ).then((m) => ({ default: m.SalesChartsStatistics }))
);
const SalesTable = lazy(() =>
  import("../../sales/components/SalesTable/SalesTable").then((m) => ({
    default: m.default,
  }))
);

export default function EmployeePage() {
  const router: AppRouterInstance = useRouter();

  const params: Params = useParams();

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("1");

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
            className="flex flex-col justify-start items-center"
          >
            <Avatar
              onClick={() => setPreviewOpen(true)}
              src={employee.avatar}
              width={240}
              className="shadow-lg border-none cursor-pointer z-10 rounded-lg mt-10"
              title="See avatar"
            />

            <h3 className="md:text-2xl font-semibold text-blueGray-700 mt-1 mb-1">
              {employee.name}
            </h3>

            <Tooltip title={"Employee Email, click to send a email"}>
              <a
                href={`mailto:${employee.email}`}
                className="flex items-center text-sm leading-normal text-gray-400 
                  font-bold px-2 py-1 shadow-sm rounded-lg border border-gray-300 mt-1"
              >
                {employee.email}
              </a>
            </Tooltip>

            {employee.username && (
              <Tooltip title="Username">
                <Tag color="blue" className="mt-2">
                  {employee.username}
                </Tag>
              </Tooltip>
            )}

            <Tag
              color={EmployeesEnum.LevelColors[employee.level]}
              className="mt-2"
            >
              {EmployeesEnum.LevelLabels[employee.level]}
            </Tag>

            <Tag
              color={EmployeesEnum.StatusColors[employee.status]}
              className="mt-2"
            >
              {EmployeesEnum.StatusLabels[employee.status]}
            </Tag>
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
              <Row gutter={[16, 16]}>
                {/* Basic Information */}
                <Col xs={24}>
                  <Descriptions
                    bordered
                    column={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
                    size="small"
                  >
                    <Descriptions.Item label="Name" span={2}>
                      <span className="font-medium">{employee.name}</span>
                    </Descriptions.Item>

                    <Descriptions.Item label="Username">
                      <Tag color="blue">{employee.username || "-"}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Email">
                      <a
                        href={`mailto:${employee.email}`}
                        className="text-blue-600"
                      >
                        {employee.email}
                      </a>
                    </Descriptions.Item>

                    <Descriptions.Item label="Birth Date">
                      {employee.birthDate
                        ? moment(employee.birthDate).format(
                            DatesEnum.Format.DDMMYYY
                          )
                        : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Gender">
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
                    </Descriptions.Item>

                    <Descriptions.Item label="Level">
                      <Tag color={EmployeesEnum.LevelColors[employee.level]}>
                        {EmployeesEnum.LevelLabels[employee.level]}
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Status">
                      <Tag color={EmployeesEnum.StatusColors[employee.status]}>
                        {EmployeesEnum.StatusLabels[employee.status]}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                {/* About */}
                {employee.about && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="About">
                        <div className="max-h-20 overflow-y-auto">
                          {employee.about}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                )}

                {/* Phone Numbers */}
                {employee.phoneNumbers && employee.phoneNumbers.length > 0 && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Phone Numbers">
                        <div className="flex flex-col gap-2">
                          {employee.phoneNumbers.map(
                            (phone: IPhoneNumber, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 flex-wrap"
                              >
                                <Tag color="blue">
                                  {PhoneNumberEnum.TypeLabels[phone.type]}
                                </Tag>
                                <a
                                  href={`tel:${phone.number}`}
                                  className="text-blue-600 font-medium"
                                >
                                  {phone.number}
                                </a>
                                {phone.messengers &&
                                  phone.messengers.length > 0 && (
                                    <div className="flex gap-1">
                                      {phone.messengers.map(
                                        (
                                          messenger: PhoneNumberEnum.PhoneNumberMessenger,
                                          messengerIndex: number
                                        ) => (
                                          <Tag
                                            key={messengerIndex}
                                            color="green"
                                          >
                                            {
                                              PhoneNumberEnum
                                                .PhoneNumberMessengerLabels[
                                                messenger
                                              ]
                                            }
                                          </Tag>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            )
                          )}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                )}

                {/* Addresses */}
                {employee.addresses && employee.addresses.length > 0 && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Addresses">
                        <div className="flex flex-col gap-3">
                          {employee.addresses.map(
                            (address: IAddress, index: number) => (
                              <div
                                key={index}
                                className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50 rounded"
                              >
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {address.types &&
                                    address.types.map(
                                      (
                                        type: AddressEnum.Type,
                                        typeIndex: number
                                      ) => (
                                        <Tag key={typeIndex} color="purple">
                                          {AddressEnum.TypesLabels[type]}
                                        </Tag>
                                      )
                                    )}
                                </div>
                                <div className="text-sm space-y-1">
                                  <div>
                                    <span className="font-medium">
                                      {address.address1}
                                    </span>
                                    {address.address2 && (
                                      <span>, {address.address2}</span>
                                    )}
                                  </div>
                                  <div className="text-gray-600">
                                    {address.district}, {address.city} -{" "}
                                    {address.state?.name}
                                  </div>
                                  <div className="text-gray-600">
                                    {address.zip} - {address.country?.name}
                                  </div>
                                  {address.description && (
                                    <div className="text-gray-500 italic">
                                      {address.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                )}

                {/* Tags */}
                <Col xs={24}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Tags">
                      <div className="max-w-full overflow-x-auto py-1">
                        <div className="flex flex-wrap gap-1">
                          <TagTagsCustomAntd
                            tags={tags}
                            useTag
                            tagsIds={employee.tagsIds}
                          />
                        </div>
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                {/* Dates & Upload Info */}
                <Col xs={24}>
                  <Descriptions
                    bordered
                    column={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
                    size="small"
                  >
                    {employee.uploadFilename && (
                      <Descriptions.Item label="Upload Filename">
                        <Tag color="orange">{employee.uploadFilename}</Tag>
                      </Descriptions.Item>
                    )}

                    <Descriptions.Item label="Created At">
                      {employee.createdAt
                        ? moment(employee.createdAt).format(
                            DatesEnum.Format.DDMMYYYYhhmmss
                          )
                        : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Updated At">
                      {employee.updatedAt
                        ? moment(employee.updatedAt).format(
                            DatesEnum.Format.DDMMYYYYhhmmss
                          )
                        : "-"}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </ContainerTitle>
          </Col>
        </Row>
      </Card>

      <Card className="mt-4">
        <Tabs
          defaultActiveKey="1"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "1",
              label: "Sales Chart",
              children: (
                <Suspense
                  fallback={
                    <div className="flex justify-center p-8">
                      <Spin size="large" />
                    </div>
                  }
                >
                  <SalesBalance employeeId={employeeId} />
                  <SalesChartsStatistics employeeId={employeeId} />
                  <SalesChart employeeId={employeeId} />
                </Suspense>
              ),
            },
            {
              key: "2",
              label: "Sales Table",
              children: (
                <Suspense
                  fallback={
                    <div className="flex justify-center p-8">
                      <Spin size="large" />
                    </div>
                  }
                >
                  <SalesTable employeeId={employeeId} />
                </Suspense>
              ),
            },
          ]}
        />
      </Card>

      <Suspense fallback={null}>
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
      </Suspense>
    </Layout>
  );
}
