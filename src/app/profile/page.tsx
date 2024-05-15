"use client";

import { useState } from "react";

import { Button, Card, Col, Image, Modal, Row, Tag, Tooltip } from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { EditOutlined } from "@ant-design/icons";

import { AddressesTag } from "../../components/common/AddressesTag/AddressesTag";
import Avatar from "../../components/common/Avatar/Avatar";
import ContainerTitle from "../../components/common/ContainerTitle/ContainerTitle";
import Description from "../../components/common/Description/Description";
import {
  IconAtSymbol,
  IconCake,
  IconFinger,
  IconIdentification,
  IconPencilSquare,
  IconPhone,
  IconQuestion,
  IconUser,
} from "../../components/common/icons/icons";
import LoadingFull from "../../components/common/LoadingFull/LoadingFull";
import { PhoneNumbersTag } from "../../components/common/PhoneNumbersTag/PhoneNumbersTag";
import Layout from "../../components/template/Layout/Layout";
import useAuthData from "../../data/context/auth/useAuthData";
import UsersEnum from "../../shared/business/users/users.enum";
import Urls from "../../shared/common/routes-app/routes-app";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { defaultAvatarImage } from "../../shared/utils/images/files-names";
import { getImageUrl } from "../../shared/utils/images/url-images";
import { getUserName } from "../../shared/utils/string-extensions/string-extensions";

export default function ProfilePage() {
  const { user } = useAuthData();

  const router: AppRouterInstance = useRouter();

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  if (!user) {
    return <LoadingFull />;
  }

  return (
    <Layout title="Profile" subtitle="See my information">
      <Card className=" h-min-80 mt-10">
        <div className="flex justify-center absolute right-0 w-full -top-16">
          <Avatar
            onClick={() => setPreviewOpen(true)}
            src={user.avatar}
            width={180}
            className="shadow-lg border-none cursor-pointer z-10"
            title="See avatar"
          />
        </div>

        <Modal
          open={previewOpen}
          footer={null}
          onCancel={() => setPreviewOpen(false)}
        >
          <Image
            alt="preview image"
            style={{ width: "100%" }}
            preview={false}
            src={user.avatar ? getImageUrl(user.avatar) : defaultAvatarImage}
          />
        </Modal>

        <div className="flex justify-end relative">
          <Button
            type="success"
            onClick={() => router.push(Urls.PROFILE_EDIT)}
            className="px-3 shadow-lg"
            icon={<EditOutlined />}
          >
            Edit
          </Button>
        </div>

        <div className="flex flex-col justify-center items-center text-center mt-20 mb-5">
          <h3 className="sm:text-sm md:text-4xl font-semibold text-blueGray-700 mb-2">
            {getUserName(user)}
          </h3>

          <Tooltip title={"My Email, click to send a email"}>
            <a
              href={`mailto:${user.email}`}
              className="flex items-center text-sm leading-normal mt-0 mb-2 text-gray-400 
            font-bold px-2 py-1 shadow-sm rounded-lg border border-gray-300
            w-min"
            >
              {IconAtSymbol("w-3.5 h-3.5")}
              {user.email}
            </a>
          </Tooltip>
        </div>

        <ContainerTitle title="Information" className="mt-6">
          <div className="flex">
            <Description
              label="Logged By"
              className="mr-5"
              description={
                <Tag
                  color={
                    UsersEnum.ProviderColors[
                      user.loggedByAuthProvider ?? UsersEnum.Provider.OTHER
                    ]
                  }
                >
                  {
                    UsersEnum.ProviderLabels[
                      user.loggedByAuthProvider ?? UsersEnum.Provider.OTHER
                    ]
                  }
                </Tag>
              }
              leftIcon={IconFinger()}
            />

            <Description
              label="Auth Provider"
              className="mr-5"
              description={
                <Tag
                  color={
                    UsersEnum.ProviderColors[
                      user.authProvider ?? UsersEnum.Provider.OTHER
                    ]
                  }
                >
                  {
                    UsersEnum.ProviderLabels[
                      user.authProvider ?? UsersEnum.Provider.OTHER
                    ]
                  }
                </Tag>
              }
              leftIcon={IconFinger()}
            />

            <Description
              label="Status"
              description={
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
              }
              leftIcon={IconQuestion()}
            />
          </div>
        </ContainerTitle>

        <ContainerTitle title="Profile" className="mt-6">
          <Row>
            <Col xs={24} md={12}>
              <Description
                label="My name"
                description={`${user.name ?? "-"}`}
                leftIcon={IconUser()}
              />

              <Description
                label="Username"
                description={user.username ?? ""}
                leftIcon={IconIdentification()}
              />

              <Description
                label="Email"
                description={user.email ?? ""}
                leftIcon={IconAtSymbol()}
              />

              <Description
                label="Phone Numbers"
                className="overflow-x-auto"
                description={
                  <div className="w-full flex">
                    <PhoneNumbersTag phoneNumbers={user.phoneNumbers} />
                  </div>
                }
                leftIcon={IconPhone()}
              />
            </Col>

            <Col xs={24} md={12}>
              <div className="flex items-start mt-4 ">
                <span className="mr-3">{IconQuestion()}</span>
                <div className={`flex flex-col overflow-x-auto`}>
                  <label className="">Addresses</label>
                  <div className="w-full overflow-x-auto flex">
                    <AddressesTag addresses={user.addresses} />
                  </div>
                </div>
              </div>

              <Description
                label="Birth date"
                leftIcon={IconCake()}
                description={
                  user.birthDate
                    ? moment(user.birthDate).format(DatesEnum.Format.DDMMYYY)
                    : "-"
                }
              />

              <Description
                label="Gender"
                leftIcon={IconQuestion()}
                description={
                  <Tag
                    color={
                      UsersEnum.GenderColors[
                        user.gender ?? UsersEnum.Gender.OTHER
                      ]
                    }
                  >
                    {
                      UsersEnum.GenderLabels[
                        user.gender ?? UsersEnum.Gender.OTHER
                      ]
                    }
                  </Tag>
                }
              />

              {user.about && (
                <Description
                  label="About"
                  description={user.about}
                  leftIcon={IconPencilSquare()}
                />
              )}
            </Col>
          </Row>
        </ContainerTitle>
      </Card>
    </Layout>
  );
}
