"use client";

import { useState } from "react";

import {
  Button,
  Card,
  Col,
  Descriptions,
  Image,
  Modal,
  Row,
  Tag,
  Tooltip,
} from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { EditOutlined, GoogleOutlined } from "@ant-design/icons";

import Avatar from "../../components/common/Avatar/Avatar";
import ContainerTitle from "../../components/common/ContainerTitle/ContainerTitle";
import LoadingFull from "../../components/common/LoadingFull/LoadingFull";
import Layout from "../../components/template/Layout/Layout";
import useAuthData from "../../data/context/auth/useAuthData";
import EmployeesEnum from "../../shared/business/employees/employees.enum";
import AddressEnum from "../../shared/business/shared/address/address.enum";
import { IAddress } from "../../shared/business/shared/address/address.interface";
import PersonEnum from "../../shared/business/shared/person/person.enum";
import PhoneNumberEnum from "../../shared/business/shared/phone/phone-number.enum";
import { IPhoneNumber } from "../../shared/business/shared/phone/phone-number.interface";
import UsersEnum from "../../shared/business/users/users.enum";
import Urls from "../../shared/common/routes-app/routes-app";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { getImageUrl } from "../../shared/utils/images/images-url";
import ImagesEnum from "../../shared/utils/images/images.enum";
import { getUserName } from "../../shared/utils/strings/string";

export default function ProfilePage() {
  const { user, employee } = useAuthData();

  const router: AppRouterInstance = useRouter();

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  if (!user) {
    return <LoadingFull />;
  }

  return (
    <Layout title="Profile" subtitle="See my information">
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
              src={user.avatar}
              width={240}
              className="shadow-lg border-none cursor-pointer z-10 rounded-lg mt-10"
              title="See avatar"
            />

            <h3 className="md:text-2xl font-semibold text-blueGray-700 mt-1 mb-1">
              {getUserName(user)}
            </h3>

            <Tooltip title={"My Email, click to send a email"}>
              <a
                href={`mailto:${user.email}`}
                className="flex items-center text-sm leading-normal text-gray-400 
                  font-bold px-2 py-1 shadow-sm rounded-lg border border-gray-300 mt-1"
              >
                {user.email}
              </a>
            </Tooltip>

            {user.username && (
              <Tooltip title="Username">
                <Tag color="blue" className="mt-2">
                  {user.username}
                </Tag>
              </Tooltip>
            )}

            <Tag
              color={
                UsersEnum.StatusColors[user.status ?? UsersEnum.Status.PENDING]
              }
              className="mt-2"
            >
              {UsersEnum.StatusLabels[user.status ?? UsersEnum.Status.PENDING]}
            </Tag>
          </Col>

          <Col xs={24} sm={14} md={19}>
            <ContainerTitle
              title="Information"
              extraHeader={
                employee?.level !== EmployeesEnum.Level.EMPLOYEE && (
                  <Tooltip title="Edit profile">
                    <Button
                      type="success"
                      icon={<EditOutlined />}
                      onClick={() => router.push(Urls.PROFILE_EDIT)}
                    >
                      Edit
                    </Button>
                  </Tooltip>
                )
              }
            >
              <Row gutter={[16, 16]}>
                {/* Authentication Information */}
                <Col xs={24}>
                  <Descriptions
                    bordered
                    column={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
                    size="small"
                    title="Authentication"
                  >
                    <Descriptions.Item label="Logged By">
                      <Tag
                        color={
                          UsersEnum.ProviderColors[
                            user.loggedByAuthProvider ??
                              UsersEnum.Provider.OTHER
                          ]
                        }
                        icon={
                          user.loggedByAuthProvider ===
                          UsersEnum.Provider.GOOGLE ? (
                            <GoogleOutlined />
                          ) : null
                        }
                      >
                        {
                          UsersEnum.ProviderLabels[
                            user.loggedByAuthProvider ??
                              UsersEnum.Provider.OTHER
                          ]
                        }
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Auth Provider">
                      <Tag
                        color={
                          UsersEnum.ProviderColors[
                            user.authProvider ?? UsersEnum.Provider.OTHER
                          ]
                        }
                        icon={
                          user.authProvider === UsersEnum.Provider.GOOGLE ? (
                            <GoogleOutlined />
                          ) : null
                        }
                      >
                        {
                          UsersEnum.ProviderLabels[
                            user.authProvider ?? UsersEnum.Provider.OTHER
                          ]
                        }
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Status">
                      <Tag
                        color={
                          UsersEnum.StatusColors[
                            user.status ?? UsersEnum.Status.PENDING
                          ]
                        }
                      >
                        {
                          UsersEnum.StatusLabels[
                            user.status ?? UsersEnum.Status.PENDING
                          ]
                        }
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                {/* Basic Information */}
                <Col xs={24}>
                  <Descriptions
                    bordered
                    column={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
                    size="small"
                    title="Personal Information"
                  >
                    <Descriptions.Item label="Name" span={2}>
                      <span className="font-medium">{user.name || "-"}</span>
                    </Descriptions.Item>

                    <Descriptions.Item label="Username">
                      <Tag color="blue">{user.username || "-"}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Email">
                      <a
                        href={`mailto:${user.email}`}
                        className="text-blue-600"
                      >
                        {user.email}
                      </a>
                    </Descriptions.Item>

                    <Descriptions.Item label="Birth Date">
                      {user.birthDate
                        ? moment(user.birthDate).format(
                            DatesEnum.Format.DDMMYYY
                          )
                        : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Gender">
                      <Tag
                        color={
                          PersonEnum.GenderColors[
                            user.gender ?? PersonEnum.Gender.OTHER
                          ]
                        }
                      >
                        {
                          PersonEnum.GenderLabels[
                            user.gender ?? PersonEnum.Gender.OTHER
                          ]
                        }
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                {/* About */}
                {user.about && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="About">
                        <div className="max-h-20 overflow-y-auto">
                          {user.about}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                )}

                {/* Phone Numbers */}
                {user.phoneNumbers && user.phoneNumbers.length > 0 && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Phone Numbers">
                        <div className="flex flex-col gap-2">
                          {user.phoneNumbers.map(
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
                {user.addresses && user.addresses.length > 0 && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Addresses">
                        <div className="flex flex-col gap-3">
                          {user.addresses.map(
                            (address: IAddress, index: number) => (
                              <div
                                key={index}
                                className="border-l-4 border-indigo-500 pl-3 py-2 bg-gray-50 rounded"
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

                {/* Dates */}
                <Col xs={24}>
                  <Descriptions
                    bordered
                    column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2 }}
                    size="small"
                  >
                    <Descriptions.Item label="Created At">
                      {user.createdAt
                        ? moment(user.createdAt).format(
                            DatesEnum.Format.DDMMYYYYhhmmss
                          )
                        : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Updated At">
                      {user.updatedAt
                        ? moment(user.updatedAt).format(
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
            user.avatar
              ? getImageUrl(user.avatar)
              : ImagesEnum.FilesNames.DefaultAvatarImage
          }
        />
      </Modal>
    </Layout>
  );
}
