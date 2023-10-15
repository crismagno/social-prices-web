"use client";

import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";

import Avatar from "../../../components/common/Avatar/Avatar";
import BackButton from "../../../components/common/BackButton/BackButton";
import Button from "../../../components/common/Button/Button";
import Card from "../../../components/common/Card/Card";
import Collapse from "../../../components/common/Collapse/Collapse";
import ContainerTitle from "../../../components/common/ContainerTitle/ContainerTitle";
import FormInput from "../../../components/common/FormInput/FormInput";
import FormSelect, {
  FormSelectOption,
} from "../../../components/common/FormSelect/FormSelect";
import { IconPlus, IconTrash } from "../../../components/common/icons/icons";
import Layout from "../../../components/template/Layout/Layout";
import useAuthData from "../../../data/hook/useAuthData";
import { IUserAddress } from "../../../shared/business/users/user.interface";
import UsersEnum from "../../../shared/business/users/users.enum";
import citiesMockData from "../../../shared/utils/mock-data/brazil-cities.json";
import statesMockData from "../../../shared/utils/mock-data/brazil-states.json";
import countriesMockData from "../../../shared/utils/mock-data/countries.json";
import {
  ICityMockData,
  ICountryMockData,
  IStateMockData,
} from "../../../shared/utils/mock-data/interfaces";

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
  isCollapsed: boolean;
}

type IProfileEditForm = {
  firstName: string;
  middleName?: string;
  lastName: string;
  username: string;
  email: string;
  birthDate?: Date;
  gender?: UsersEnum.Gender;
  addresses: IProfileEditFormAddress[];
};

const countries: ICountryMockData[] = countriesMockData.filter(
  (country) => country.code === "BR"
);
const states: IStateMockData[] = statesMockData;
const stateCities: ICityMockData[] = citiesMockData.states;

const generateNewAddress = (
  isCollapsed: boolean = true
): IProfileEditFormAddress => ({
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
  isCollapsed,
});

export default function ProfileEdit() {
  const { user } = useAuthData();

  const defaultValues: IProfileEditForm = {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    addresses: user?.addresses?.length
      ? user.addresses.map((address: IUserAddress, index: number) => ({
          ...address,
          countryCode: address.country.code,
          stateCode: address.state?.code,
          isCollapsed: index === 0,
        }))
      : [generateNewAddress(false)],
    birthDate: user?.birthDate ?? new Date(),
    email: user?.email,
    gender: user?.gender ?? UsersEnum.Gender.FEMALE,
    middleName: user?.middleName ?? "",
    username: user?.username,
  };

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<IProfileEditForm>({
    defaultValues,
  });

  const { append, fields, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  const onSubmit: SubmitHandler<IProfileEditForm> = (data) => console.log(data);

  const addNewAddress = () => append(generateNewAddress());

  const removeNewAddress = (index: number) => remove(index);

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
              <FormInput
                label="Username"
                placeholder={"Enter with a username"}
                defaultValue={user?.username}
                disabled
                register={register}
                registerName="username"
              />

              <FormInput
                label="Password"
                type="password"
                defaultValue="12345678910"
                disabled
                register={register}
                registerName="password"
              />
            </div>

            <div className="flex flex-col justify-start w-1/2">
              <FormInput
                label="Email"
                defaultValue={user?.email}
                register={register}
                registerName="email"
                disabled
              />
            </div>
          </div>
        </ContainerTitle>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <ContainerTitle title="Profile" className="mt-10">
            <div className="flex">
              <div className="flex flex-col justify-start w-1/2">
                <FormInput
                  label="First name"
                  placeholder={"Enter first name"}
                  defaultValue={user?.firstName ?? ""}
                  register={register}
                  registerName="firstName"
                  registerOptions={{ required: true }}
                  errorMessage={errors.firstName && "First name is required"}
                />

                <FormInput
                  label="Middle name"
                  placeholder={"Enter middle name"}
                  defaultValue={user?.middleName ?? ""}
                  register={register}
                  registerName="middleName"
                />

                <FormInput
                  label="Last name"
                  placeholder={"Enter last name"}
                  defaultValue={user?.lastName ?? ""}
                  register={register}
                  registerName="lastName"
                  registerOptions={{ required: true }}
                  errorMessage={errors.lastName && "Last name is required"}
                />
              </div>

              <div className="flex flex-col justify-start w-1/2">
                <FormInput
                  label="Birth date"
                  type="datetime-local"
                  placeholder={"Enter birth date"}
                  defaultValue={user?.birthDate + "" ?? ""}
                  register={register}
                  registerName="birthDate"
                />

                <FormSelect
                  label="Gender"
                  placeholder={"Select gender"}
                  defaultValue={user?.gender ?? UsersEnum.Gender.MALE}
                  register={register}
                  registerName="gender"
                >
                  {Object.keys(UsersEnum.Gender).map((gender: any) => (
                    <FormSelectOption key={gender} value={gender}>
                      {UsersEnum.GenderLabels[gender]}
                    </FormSelectOption>
                  ))}
                </FormSelect>
              </div>
            </div>

            <div className="flex justify-center mt-5">
              <Button color="success" onClick={handleSubmit(onSubmit)}>
                Save Profile
              </Button>
            </div>
          </ContainerTitle>
        </form>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <ContainerTitle
            title={
              <div className="flex items-center">
                <label className="mr-4">Addresses</label>

                <Button
                  onClick={addNewAddress}
                  color="primary"
                  className="rounded-r-full rounded-l-full"
                >
                  {IconPlus()}
                </Button>
              </div>
            }
            className="mt-10"
          >
            {fields.map(
              (formAddress: IProfileEditFormAddress, index: number) => {
                const addressComplete: string = fields[index].address1;

                return (
                  <Collapse
                    key={index}
                    collapsed={formAddress.isCollapsed}
                    title={`Address (${index + 1})`}
                    className="relative mt-5"
                    extraHeader={
                      <Button
                        onClick={() => removeNewAddress(index)}
                        color="transparent"
                        className="rounded-r-full rounded-l-full absolute right-2 shadow-none"
                      >
                        {IconTrash("w-3 h-3 text-red-500 hover:text-red-600")}
                      </Button>
                    }
                  >
                    <div className="flex">
                      <div className="flex flex-col justify-start w-1/2">
                        <FormSelect
                          label="Country"
                          placeholder={"Select country"}
                          defaultValue={formAddress.countryCode}
                          register={register}
                          registerName={`addresses.${index}.countryCode`}
                          registerOptions={{ required: true }}
                          errorMessage={
                            errors?.addresses?.[index]?.countryCode &&
                            "Country is required"
                          }
                        >
                          {countries.map((country: ICountryMockData) => (
                            <FormSelectOption
                              key={country.code}
                              value={country.code}
                            >
                              {country.name}
                            </FormSelectOption>
                          ))}
                        </FormSelect>

                        <FormInput
                          label="Zipcode"
                          placeholder={"Enter zipcode"}
                          defaultValue={formAddress.zip}
                          register={register}
                          registerName={`addresses.${index}.zip`}
                          registerOptions={{ required: true }}
                          errorMessage={
                            errors?.addresses?.[index]?.zip &&
                            "Zipcode is required"
                          }
                        />

                        <FormInput
                          label="District"
                          placeholder={"Enter district"}
                          defaultValue={formAddress.district}
                          register={register}
                          registerName={`addresses.${index}.district`}
                          registerOptions={{ required: true }}
                          errorMessage={
                            errors?.addresses?.[index]?.district &&
                            "District is required"
                          }
                        />
                      </div>

                      <div className="flex flex-col justify-start w-1/2">
                        <FormSelect
                          label="State"
                          placeholder={"Select state"}
                          defaultValue={formAddress.stateCode}
                          register={register}
                          registerName={`addresses.${index}.stateCode`}
                          registerOptions={{ required: true }}
                          errorMessage={
                            errors?.addresses?.[index]?.stateCode &&
                            "State is required"
                          }
                        >
                          {states.map((state: IStateMockData) => (
                            <FormSelectOption
                              key={state.code}
                              value={state.code}
                            >
                              {state.name}
                            </FormSelectOption>
                          ))}
                        </FormSelect>

                        <FormInput
                          label="Address 1"
                          placeholder={"Enter address 1"}
                          defaultValue={formAddress.address1}
                          register={register}
                          registerName={`addresses.${index}.address1`}
                          registerOptions={{ required: true }}
                          errorMessage={
                            errors?.addresses?.[index]?.address1 &&
                            "Address1 is required"
                          }
                        />

                        <FormInput
                          label="Description"
                          placeholder={"Enter description"}
                          defaultValue={formAddress.description}
                          register={register}
                          registerName={`addresses.${index}.description`}
                        />
                      </div>

                      <div className="flex flex-col justify-start w-1/2">
                        <FormSelect
                          label="City"
                          placeholder={"Select city"}
                          defaultValue={formAddress.city}
                          register={register}
                          registerName={`addresses.${index}.city`}
                          registerOptions={{ required: true }}
                          errorMessage={
                            errors?.addresses?.[index]?.city &&
                            "City is required"
                          }
                        >
                          {stateCities
                            .find((stateCity) => stateCity.stateCode === "CE")
                            ?.cities.map((city: string) => (
                              <FormSelectOption key={city} value={city}>
                                {city}
                              </FormSelectOption>
                            ))}
                        </FormSelect>

                        <FormInput
                          label="Address 2"
                          placeholder={"Enter address 2"}
                          defaultValue={formAddress.address2}
                          register={register}
                          registerName={`addresses.${index}.address2`}
                        />
                      </div>
                    </div>
                  </Collapse>
                );
              }
            )}

            <div className="flex justify-center mt-5">
              <Button color="success" disabled={fields.length === 0}>
                Save Addresses
              </Button>
            </div>
          </ContainerTitle>
        </form>
      </Card>
    </Layout>
  );
}
