"use client";

import { useState } from "react";

import { Button, Modal, Tag, Tooltip } from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { EditOutlined } from "@ant-design/icons";

import Avatar from "../../components/common/Avatar/Avatar";
import Card from "../../components/common/Card/Card";
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
import Layout from "../../components/template/Layout/Layout";
import useAuthData from "../../data/hook/useAuthData";
import { IPhoneNumber } from "../../shared/business/users/user.interface";
import UsersEnum from "../../shared/business/users/users.enum";
import Urls from "../../shared/common/routes-app/routes-app";
import { defaultAvatarImage } from "../../shared/utils/images/files-names";
import { getImageAwsS3 } from "../../shared/utils/images/url-images";
import {
  createUserAddressName,
  messengersToString,
} from "../../shared/utils/string-extensions/string-extensions";

export default function Profile() {
  const { user } = useAuthData();

  const router: AppRouterInstance = useRouter();

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const getUserName = (): string => {
    let userName = user?.firstName ?? "";

    if (user?.middleName) {
      userName += ` ${user.middleName}`;
    }

    if (user?.lastName) {
      userName += ` ${user.lastName}`;
    }

    return userName;
  };

  return (
    <Layout title="Profile" subtitle="See your information">
      <Card className=" h-min-80 mt-10">
        <div className="flex justify-center absolute right-0 w-full -top-16">
          <div className="cursor-pointer" onClick={() => setPreviewOpen(true)}>
            <Avatar
              src={user?.avatar}
              width={130}
              className="shadow-lg border-none"
              title="See avatar"
            />
          </div>
        </div>

        <Modal
          open={previewOpen}
          footer={null}
          onCancel={() => setPreviewOpen(false)}
        >
          <img
            alt="preview image"
            style={{ width: "100%" }}
            src={
              user?.avatar ? getImageAwsS3(user?.avatar) : defaultAvatarImage
            }
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

        <div className="flex flex-col justify-center items-center text-center mt-10 mb-5">
          <h3 className="sm:text-sm md:text-4xl font-semibold text-blueGray-700 mb-2">
            {getUserName() || user?.username}
          </h3>

          <Tooltip title={"My Email, click to send a email"}>
            <a
              href={`mailto:${user?.email}`}
              className="flex items-center text-sm leading-normal mt-0 mb-2 text-gray-400 
            font-bold px-2 py-1 shadow-sm rounded-lg border border-gray-300
            w-min"
            >
              {IconAtSymbol("w-3.5 h-3.5")}
              {user?.email}
            </a>
          </Tooltip>
        </div>

        <ContainerTitle title="Information" className="mt-6">
          <div className="flex">
            <Description
              label="Logged By"
              className="mr-5"
              description={
                user?.loggedByAuthProvider
                  ? UsersEnum.ProviderLabels[user.loggedByAuthProvider]
                  : UsersEnum.ProviderLabels.OTHER
              }
              leftIcon={IconFinger()}
            />

            <Description
              label="Auth Provider"
              className="mr-5"
              description={
                user?.authProvider
                  ? UsersEnum.ProviderLabels[user.authProvider]
                  : ""
              }
              leftIcon={IconFinger()}
            />

            <Description
              label="Status"
              description={
                <Tag
                  color={
                    UsersEnum.StatusColors[
                      user?.status ?? UsersEnum.Status.PENDING
                    ]
                  }
                >
                  {
                    UsersEnum.StatusLabels[
                      user?.status ?? UsersEnum.Status.PENDING
                    ]
                  }
                </Tag>
              }
              leftIcon={IconQuestion()}
            />
          </div>
        </ContainerTitle>

        <ContainerTitle title="Profile" className="mt-6">
          <div className="flex flex-wrap mt-5">
            <div className="flex flex-col justify-start w-1/2">
              <Description
                label="My name"
                description={`${user?.firstName ?? "-"} ${
                  user?.middleName ?? "-"
                } ${user?.lastName ?? "-"}`}
                leftIcon={IconUser()}
              />

              <Description
                label="Username"
                description={user?.username ?? ""}
                leftIcon={IconIdentification()}
              />

              <Description
                label="Email"
                description={user?.email ?? ""}
                leftIcon={IconAtSymbol()}
              />

              <Description
                label="Phone Numbers"
                className="overflow-x-auto"
                description={
                  <div className="w-full flex">
                    {user?.phoneNumbers?.length ? (
                      user?.phoneNumbers.map((phoneNumber: IPhoneNumber) => (
                        <Tooltip
                          key={phoneNumber.number}
                          title={messengersToString(phoneNumber.messengers)}
                        >
                          <Tag key={phoneNumber.number}>{`${
                            UsersEnum.PhoneTypesLabels[phoneNumber.type]
                          } - ${phoneNumber.number}`}</Tag>
                        </Tooltip>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">---</span>
                    )}
                  </div>
                }
                leftIcon={IconPhone()}
              />
            </div>

            <div className="flex flex-col justify-start w-1/2">
              <div className="flex items-start mt-4 ">
                <span className="mr-3">{IconQuestion()}</span>
                <div className={`flex flex-col overflow-x-auto`}>
                  <label className="">Addresses</label>
                  <div className="w-full overflow-x-auto flex">
                    {user?.addresses?.length ? (
                      user?.addresses.map((address) => (
                        <Tag key={address.uid}>
                          {createUserAddressName(address)}
                        </Tag>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">---</span>
                    )}
                  </div>
                </div>
              </div>

              <Description
                label="Birth date"
                leftIcon={IconCake()}
                description={
                  user?.birthDate
                    ? moment(user?.birthDate).format("MM/DD/YYYY")
                    : "---"
                }
              />

              <Description
                label="Gender"
                leftIcon={IconQuestion()}
                description={
                  <Tag
                    color={
                      UsersEnum.GenderColors[
                        user?.gender ?? UsersEnum.Gender.OTHER
                      ]
                    }
                  >
                    {
                      UsersEnum.GenderLabels[
                        user?.gender ?? UsersEnum.Gender.OTHER
                      ]
                    }
                  </Tag>
                }
              />

              {user?.about && (
                <Description
                  label="About"
                  description={user?.about}
                  leftIcon={IconPencilSquare()}
                />
              )}
            </div>
          </div>
        </ContainerTitle>
      </Card>
    </Layout>
  );
}
