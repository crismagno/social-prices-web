"use client";

import { useEffect, useState } from "react";

import Avatar from "../../../components/common/Avatar/Avatar";
import BackButton from "../../../components/common/BackButton/BackButton";
import Button from "../../../components/common/Button/Button";
import Card from "../../../components/common/Card/Card";
import Collapse from "../../../components/common/Collapse/Collapse";
import ContainerTitle from "../../../components/common/ContainerTitle/ContainerTitle";
import DescriptionInput from "../../../components/common/DescriptionInput/DescriptionInput";
import DescriptionSelect, {
  DescriptionSelectOption,
} from "../../../components/common/DescriptionSelect/DescriptionSelect";
import { IconPlus } from "../../../components/common/icons/icons";
import Layout from "../../../components/template/Layout/Layout";
import useAuthData from "../../../data/hook/useAuthData";
import UsersEnum from "../../../shared/business/users/users.enum";
import citiesMockData from "../../../shared/utils/mock-data/brazil-cities.json";
import statesMockData from "../../../shared/utils/mock-data/brazil-states.json";
import countriesMockData from "../../../shared/utils/mock-data/countries.json";
import {
  ICityMockData,
  ICountryMockData,
  IStateMockData,
} from "../../../shared/utils/mock-data/interfaces";

interface IProfileEditForm {
  firstName: string;
  middleName?: string;
  lastName: string;
  username: string;
  email: string;
  birthDate?: Date;
  gender?: UsersEnum.Gender;
  addresses: IProfileEditFormAddress[];
}

interface IProfileEditFormAddress {
  address1: string;
  address2?: string;
  city: string;
  isValid: boolean;
  stateCode?: string;
  uid: string;
  zip: string;
  description?: string;
  countryCode: string;
  district: string;
}

enum ProfileEditFormKeysEnum {
  firstName = "firstName",
  middleName = "middleName",
  lastName = "lastName",
  username = "username",
  email = "email",
  birthDate = "birthDate",
  gender = "gender",
}

export default function ProfileEdit() {
  const { user } = useAuthData();

  const countries: ICountryMockData[] = countriesMockData.filter(
    (country) => country.code === "BR"
  );
  const states: IStateMockData[] = statesMockData;
  const stateCities: ICityMockData[] = citiesMockData.states;

  const [form, setForm] = useState<IProfileEditForm>({
    email: user?.email ?? "",
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    username: user?.username ?? "",
    birthDate: user?.birthDate ?? new Date(),
    middleName: user?.middleName ?? "",
    gender: user?.gender,
    addresses: [
      {
        address1: "",
        city: "",
        countryCode: countries[0].code,
        isValid: true,
        uid: "",
        zip: "",
        address2: "",
        description: "",
        stateCode: "",
        district: "",
      },
    ],
  });

  useEffect(() => {
    setForm({
      email: user?.email ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      username: user?.username ?? "",
      birthDate: user?.birthDate ?? new Date(),
      middleName: user?.middleName ?? "",
      gender: user?.gender,
      addresses: [
        {
          address1: "",
          city: "",
          countryCode: countries[0].code,
          isValid: true,
          uid: `${Date.now()}`,
          zip: "",
          address2: "",
          description: "",
          stateCode: "",
          district: "",
        },
      ],
    });
  }, [user]);

  const handleChangeForm = (
    value: string,
    field: ProfileEditFormKeysEnum | string
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <Layout title="Profile Edit" subtitle="Your personal data to update">
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
          <BackButton />
        </div>

        <ContainerTitle title="Auth" className="mt-6">
          <div className="flex">
            <div className="flex flex-col justify-start w-1/2">
              <DescriptionInput
                label="Username"
                placeholder={"Enter with a username"}
                value={form.username}
                onChange={(value: string) =>
                  handleChangeForm(value, ProfileEditFormKeysEnum.username)
                }
                disabled
              />

              <DescriptionInput
                label="Password"
                type="password"
                value="12345678910"
                disabled
              />
            </div>

            <div className="flex flex-col justify-start w-1/2">
              <DescriptionInput
                label="Email"
                value={form.email}
                onChange={(value: string) =>
                  handleChangeForm(value, ProfileEditFormKeysEnum.email)
                }
                disabled
              />
            </div>
          </div>
        </ContainerTitle>

        <ContainerTitle title="Profile" className="mt-10">
          <div className="flex">
            <div className="flex flex-col justify-start w-1/2">
              <DescriptionInput
                label="First name"
                placeholder={"Enter first name"}
                value={form.firstName}
                onChange={(value: string) =>
                  handleChangeForm(value, ProfileEditFormKeysEnum.firstName)
                }
              />

              <DescriptionInput
                label="Middle name"
                placeholder={"Enter middle name"}
                value={form.middleName}
                onChange={(value: string) =>
                  handleChangeForm(value, ProfileEditFormKeysEnum.middleName)
                }
              />

              <DescriptionInput
                label="Last name"
                placeholder={"Enter last name"}
                value={form.lastName}
                onChange={(value: string) =>
                  handleChangeForm(value, ProfileEditFormKeysEnum.lastName)
                }
              />
            </div>

            <div className="flex flex-col justify-start w-1/2">
              <DescriptionInput
                label="Birth date"
                type="datetime-local"
                placeholder={"Enter your birth date"}
                value={form.birthDate}
                onChange={(value: string) =>
                  handleChangeForm(value, ProfileEditFormKeysEnum.birthDate)
                }
              />

              <DescriptionSelect
                label="Gender"
                placeholder={"Select gender"}
                value={form.gender}
                onChange={(value: string) =>
                  handleChangeForm(value, ProfileEditFormKeysEnum.gender)
                }
              >
                {Object.keys(UsersEnum.Gender).map((gender: any) => (
                  <DescriptionSelectOption key={gender} value={gender}>
                    {UsersEnum.GenderLabels[gender]}
                  </DescriptionSelectOption>
                ))}
              </DescriptionSelect>
            </div>
          </div>

          <div className="flex justify-center mt-5">
            <Button type="success">Save Profile</Button>
          </div>
        </ContainerTitle>

        <ContainerTitle
          title={
            <div className="flex items-center">
              <label className="mr-4">Addresses</label>

              <Button type="primary" className="rounded-3xl">
                {IconPlus()}
              </Button>
            </div>
          }
          className="mt-10 "
        >
          {form.addresses.map(
            (formAddress: IProfileEditFormAddress, index: number) => {
              return (
                <Collapse
                  key={formAddress.uid}
                  collapsed={false}
                  title="New Address"
                  className="mt-5"
                >
                  <div className="flex">
                    <div className="flex flex-col justify-start w-1/2">
                      <DescriptionSelect
                        label="Country"
                        placeholder={"Select country"}
                        value={formAddress.countryCode}
                        onChange={(value: string) =>
                          handleChangeForm(
                            value,
                            `addresses[${index}].countryCode`
                          )
                        }
                      >
                        {countries.map((country: ICountryMockData) => (
                          <DescriptionSelectOption
                            key={country.code}
                            value={country.code}
                          >
                            {country.name}
                          </DescriptionSelectOption>
                        ))}
                      </DescriptionSelect>

                      <DescriptionInput
                        label="Zipcode"
                        placeholder={"Enter zipcode"}
                        value={formAddress.zip}
                        onChange={(value: string) =>
                          handleChangeForm(value, `addresses[${index}].zipcode`)
                        }
                      />

                      <DescriptionInput
                        label="District"
                        placeholder={"Enter with district"}
                        value={formAddress.district}
                        onChange={(value: string) =>
                          handleChangeForm(
                            value,
                            `addresses[${index}].district`
                          )
                        }
                      />
                    </div>

                    <div className="flex flex-col justify-start w-1/2">
                      <DescriptionSelect
                        label="State"
                        placeholder={"Select state"}
                        value={formAddress.stateCode}
                        onChange={(value: string) =>
                          handleChangeForm(
                            value,
                            `addresses[${index}].stateCode`
                          )
                        }
                      >
                        {states.map((state: IStateMockData) => (
                          <DescriptionSelectOption
                            key={state.code}
                            value={state.code}
                          >
                            {state.name}
                          </DescriptionSelectOption>
                        ))}
                      </DescriptionSelect>

                      <DescriptionInput
                        label="Address 1"
                        placeholder={"Enter address 1"}
                        value={formAddress.address1}
                        onChange={(value: string) =>
                          handleChangeForm(
                            value,
                            `addresses[${index}].address1`
                          )
                        }
                      />

                      <DescriptionInput
                        label="Description"
                        placeholder={"Enter description"}
                        value={formAddress.description}
                        onChange={(value: string) =>
                          handleChangeForm(
                            value,
                            `addresses[${index}].description`
                          )
                        }
                      />
                    </div>

                    <div className="flex flex-col justify-start w-1/2">
                      <DescriptionSelect
                        label="City"
                        placeholder={"Select city"}
                        value={formAddress.city}
                        onChange={(value: string) =>
                          handleChangeForm(value, `addresses[${index}].city`)
                        }
                      >
                        {stateCities
                          .find((stateCity) => stateCity.stateCode === "CE")
                          ?.cities.map((city: string) => (
                            <DescriptionSelectOption key={city} value={city}>
                              {city}
                            </DescriptionSelectOption>
                          ))}
                      </DescriptionSelect>

                      <DescriptionInput
                        label="Address 2"
                        placeholder={"Enter address 2"}
                        value={formAddress.address2}
                        onChange={(value: string) =>
                          handleChangeForm(
                            value,
                            `addresses[${index}].address2`
                          )
                        }
                      />
                    </div>
                  </div>
                </Collapse>
              );
            }
          )}

          <div className="flex justify-center mt-5">
            <Button type="success">Save Addresses</Button>
          </div>
        </ContainerTitle>
      </Card>
    </Layout>
  );
}
