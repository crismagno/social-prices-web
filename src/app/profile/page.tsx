"use client";

import moment from "moment";
import { useRouter } from "next/navigation";

import Avatar from "../../components/common/Avatar/Avatar";
import Button from "../../components/common/Button/Button";
import Card from "../../components/common/Card/Card";
import Description from "../../components/common/Description/Description";
import HrCustom from "../../components/common/HrCustom/HrCustom";
import {
  IconAtSymbol,
  IconCake,
  IconIdentification,
  IconPencilSquare,
  IconPhone,
  IconQuestion,
  IconUser,
} from "../../components/common/icons/icons";
import Layout from "../../components/template/Layout/Layout";
import useAuthData from "../../data/hook/useAuthData";
import UsersEnum from "../../shared/business/users/users.enum";
import Urls from "../../shared/common/routes-app/routes-app";

export default function Profile() {
  const { user } = useAuthData();

  const router = useRouter();

  return (
    <Layout title="Profile" subtitle="See your information">
      <Card className=" h-min-80 mt-10">
        <div className="flex justify-center absolute right-0 w-full -top-16">
          <div className="cursor-pointer">
            <Avatar
              src={user?.avatar}
              width={130}
              height={130}
              className="shadow-lg border-none"
            />
          </div>
        </div>

        <div className="flex justify-end relative">
          <Button
            type="success"
            onClick={() => router.push(Urls.PROFILE_EDIT)}
            className="px-3 shadow-lg"
          >
            {IconPencilSquare("mr-1")}
            Edit
          </Button>
        </div>

        <div className="flex flex-col justify-center items-center text-center mt-10 mb-5">
          <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
            {user?.username ?? "---"}
          </h3>

          <a
            href={`mailto:${user?.email}`}
            className="flex items-center text-sm leading-normal mt-0 mb-2 text-gray-400 
            font-bold px-2 py-1 shadow-sm rounded-lg border border-gray-300
            w-min"
          >
            {IconAtSymbol("w-3.5 h-3.5")}
            {user?.email}
          </a>
        </div>

        <HrCustom />

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
              label="Phone"
              description={user?.phoneNumbers[0] ?? "---"}
              leftIcon={IconPhone()}
            />
          </div>

          <div className="flex flex-col justify-start w-1/2">
            <div className="flex items-start mt-4 ">
              <span className="mr-3">{IconQuestion()}</span>
              <div className={`flex flex-col`}>
                <label className="">Addresses</label>
                <div className="w-full overflow-x-auto flex">
                  {user?.addresses?.length ? (
                    user?.addresses.map((userAddress) => (
                      <div
                        key={userAddress.uid}
                        className="text-sm text-gray-500 border border-gray-300 rounded-md px-3 py-1 mr-2"
                      >
                        {userAddress.address1}, {userAddress.city},{" "}
                        {userAddress.state?.code}, {userAddress.zip}
                      </div>
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
                user?.gender ? UsersEnum.GenderLabels[user?.gender] : "---"
              }
            />
          </div>
        </div>
      </Card>
    </Layout>
  );
}
