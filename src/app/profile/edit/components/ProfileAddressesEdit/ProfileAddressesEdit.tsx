"use client";

import { useState } from "react";

import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";

import Button from "../../../../../components/common/Button/Button";
import Collapse from "../../../../../components/common/Collapse/Collapse";
import ContainerTitle from "../../../../../components/common/ContainerTitle/ContainerTitle";
import FormInput from "../../../../../components/common/FormInput/FormInput";
import FormSelect, {
  FormSelectOption,
} from "../../../../../components/common/FormSelect/FormSelect";
import handleClientError from "../../../../../components/common/handleClientError/handleClientError";
import {
  IconPlus,
  IconTrash,
} from "../../../../../components/common/icons/icons";
import useAuthData from "../../../../../data/hook/useAuthData";
import { usersServiceMethodsInstance } from "../../../../../services/social-prices-api/users/user-service.methods";
import IUser, {
  IUserAddress,
} from "../../../../../shared/business/users/user.interface";
import citiesMockData from "../../../../../shared/utils/mock-data/brazil-cities.json";
import statesMockData from "../../../../../shared/utils/mock-data/brazil-states.json";
import countriesMockData from "../../../../../shared/utils/mock-data/countries.json";
import {
  ICityMockData,
  ICountryMockData,
  IStateMockData,
} from "../../../../../shared/utils/mock-data/interfaces";
import { createUserAddressName } from "../../../../../shared/utils/string-extensions/string-extensions";

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
  addresses: IProfileEditFormAddress[];
};

interface Props {
  className?: string;
}

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

const ProfileAddressesEdit: React.FC<Props> = ({ className = "" }) => {
  const { user, updateUserSession } = useAuthData();

  const defaultValues: IProfileEditForm = {
    addresses: user?.addresses?.length
      ? user.addresses.map((address: IUserAddress, index: number) => ({
          ...address,
          countryCode: address.country?.code,
          stateCode: address.state?.code,
          isCollapsed: index === 0,
        }))
      : [generateNewAddress(false)],
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

  const [isSubmitting, setIsSUbmitting] = useState<boolean>(false);

  const onSubmit: SubmitHandler<IProfileEditForm> = async (data) => {
    try {
      setIsSUbmitting(true);

      const addresses: IUserAddress[] = data.addresses.map(
        (address): IUserAddress => ({
          ...address,
          country: {
            code: address.countryCode,
            name:
              countries.find((country) => country.code === address.countryCode)
                ?.name ?? "",
          },
          state: {
            code: address.stateCode ?? "",
            name:
              states.find((state) => state.code === address.stateCode)?.name ??
              "",
          },
        })
      );
      const response: IUser =
        await usersServiceMethodsInstance.updateUserAddresses({
          addresses,
        });

      updateUserSession(response);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
    }
  };

  const addNewAddress = () => append(generateNewAddress());

  const removeNewAddress = (index: number) => {
    remove(index);

    if (fields.length === 1) {
      addNewAddress();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`w-full ${className}`}>
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
        extraHeader={
          <Button
            className="text-sm"
            color="success"
            disabled={fields.length === 0}
            loading={{
              isLoading: isSubmitting,
              height: 20,
              width: 20,
              element: "Updating",
            }}
          >
            Save Addresses
          </Button>
        }
        className="mt-10"
      >
        {fields.map((formAddress: IProfileEditFormAddress, index: number) => {
          const address: IProfileEditFormAddress = watch(`addresses.${index}`);

          const addressName: string = createUserAddressName(address);

          return (
            <Collapse
              key={index}
              collapsed={formAddress.isCollapsed}
              title={addressName.trim() || `Address (${index + 1})`}
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
                      <FormSelectOption key={country.code} value={country.code}>
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
                      errors?.addresses?.[index]?.zip && "Zipcode is required"
                    }
                    maxLength={20}
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
                    maxLength={200}
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
                      <FormSelectOption key={state.code} value={state.code}>
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
                    maxLength={200}
                  />

                  <FormInput
                    label="Description"
                    placeholder={"Enter description"}
                    defaultValue={formAddress.description}
                    register={register}
                    registerName={`addresses.${index}.description`}
                    maxLength={400}
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
                      errors?.addresses?.[index]?.city && "City is required"
                    }
                  >
                    {stateCities
                      .find(
                        (stateCity) => stateCity.stateCode === address.stateCode
                      )
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
                    maxLength={200}
                  />
                </div>
              </div>
            </Collapse>
          );
        })}
      </ContainerTitle>
    </form>
  );
};

export default ProfileAddressesEdit;
