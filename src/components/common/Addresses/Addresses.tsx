import { Select, Tooltip } from "antd";
import { Control, useFieldArray } from "react-hook-form";
import { z } from "zod";

import useLanguageData from "../../../data/context/language/useLanguageData";
import AddressEnum from "../../../shared/business/shared/address/address.enum";
import { IAddress } from "../../../shared/business/shared/address/address.interface";
import citiesMockData from "../../../shared/utils/mock-data/brazil-cities.json";
import statesMockData from "../../../shared/utils/mock-data/brazil-states.json";
import countriesMockData from "../../../shared/utils/mock-data/countries.json";
import {
  ICityMockData,
  ICountryMockData,
  IStateMockData,
} from "../../../shared/utils/mock-data/interfaces";
import { createAddressName } from "../../../shared/utils/strings/string";
import { InputCustomAntd } from "../../custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../custom/antd/SelectCustomAntd/SelectCustomAntd";
import ButtonCommon from "../ButtonCommon/ButtonCommon";
import Collapse from "../Collapse/Collapse";
import ContainerTitle from "../ContainerTitle/ContainerTitle";
import { IconPlus, IconTrash } from "../icons/icons";

export const countries: ICountryMockData[] = countriesMockData.filter(
  (country) => country.code === "BR"
);

export const states: IStateMockData[] = statesMockData;

export const stateCities: ICityMockData[] = citiesMockData.states;

export const addressFormSchema = z.object({
  address1: z.string().trim().nonempty("Address1 is required"),
  address2: z.string().trim().nullable(),
  city: z.string().trim().nonempty("City is required"),
  isValid: z.boolean(),
  stateCode: z.string().trim().nonempty("State is required"),
  uid: z.string(),
  zip: z.string().trim().nonempty("Zipcode is required"),
  description: z.string().trim().nullable(),
  countryCode: z.string().trim().nonempty("Country is required"),
  district: z.string().trim().nonempty("District is required"),
  isCollapsed: z.boolean(),
  types: z.array(z.string()),
});

export type TAddressFormSchema = z.infer<typeof addressFormSchema>;

export const generateNewAddress = (
  isCollapsed: boolean = true
): TAddressFormSchema => ({
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
  types: [],
});

interface Props {
  control: Control<any>;
  watch: any;
  errors: any;
  containerExtraHeader?: any;
}

export const Addresses: React.FC<Props> = ({
  control,
  watch,
  errors,
  containerExtraHeader,
}) => {
  const { t } = useLanguageData()!;

  const {
    append: appendAddress,
    fields: fieldsAddresses,
    remove: removeAddress,
  } = useFieldArray({
    control,
    name: "addresses",
  });

  const addNewAddress = () => appendAddress(generateNewAddress(false));

  const removeNewAddress = (index: number) => {
    removeAddress(index);

    if (fieldsAddresses.length === 1) {
      addNewAddress();
    }
  };

  return (
    <ContainerTitle
      extraHeader={containerExtraHeader}
      title={
        <div className="flex items-center">
          <label className="mr-4">{t("profile.addresses")}</label>

          <Tooltip title={t("address.addNewAddress")}>
            <ButtonCommon
              onClick={(e) => {
                e.preventDefault();
                addNewAddress();
              }}
              color="primary"
              className="rounded-r-full rounded-l-full"
            >
              {IconPlus()}
            </ButtonCommon>
          </Tooltip>
        </div>
      }
      className="mt-10"
    >
      {fieldsAddresses.map((formAddress: TAddressFormSchema, index: number) => {
        const address: TAddressFormSchema = watch(`addresses.${index}`);

        const addressName: string = createAddressName(address);

        return (
          <Collapse
            key={index}
            collapsed={formAddress.isCollapsed}
            title={
              addressName.trim() || `${t("common.address")} (${index + 1})`
            }
            className="relative mt-5"
            extraHeader={
              <Tooltip title={t("address.removeAddress")}>
                <ButtonCommon
                  onClick={(e) => {
                    e.preventDefault();
                    removeNewAddress(index);
                  }}
                  color="transparent"
                  className="rounded-r-full rounded-l-full absolute right-2 shadow-none"
                >
                  {IconTrash("w-3 h-3 text-red-500 hover:text-red-600")}
                </ButtonCommon>
              </Tooltip>
            }
          >
            <div className="flex">
              <div className="flex flex-col justify-start w-1/2">
                <SelectCustomAntd<IAddress>
                  controller={{
                    control,
                    name: `addresses.${index}.countryCode`,
                  }}
                  errorMessage={
                    errors?.addresses?.[index]?.countryCode?.message
                  }
                  label={t("address.country")}
                  placeholder={t("address.selectCountry")}
                >
                  {countries.map((country: ICountryMockData) => (
                    <Select.Option key={country.code} value={country.code}>
                      {country.name}
                    </Select.Option>
                  ))}
                </SelectCustomAntd>

                <InputCustomAntd
                  controller={{ control, name: `addresses.${index}.zip` }}
                  label={t("address.zipcode")}
                  placeholder={t("address.enterZipcode")}
                  errorMessage={errors?.addresses?.[index]?.zip?.message}
                  maxLength={20}
                />

                <InputCustomAntd
                  controller={{ control, name: `addresses.${index}.district` }}
                  label={t("address.district")}
                  placeholder={t("address.enterDistrict")}
                  errorMessage={errors?.addresses?.[index]?.district?.message}
                  maxLength={200}
                />
              </div>

              <div className="flex flex-col justify-start w-1/2">
                <SelectCustomAntd<IAddress>
                  controller={{ control, name: `addresses.${index}.stateCode` }}
                  errorMessage={errors?.addresses?.[index]?.stateCode?.message}
                  label={t("address.state")}
                  placeholder={t("address.selectState")}
                >
                  {states.map((state: IStateMockData) => (
                    <Select.Option key={state.code} value={state.code}>
                      {state.name}
                    </Select.Option>
                  ))}
                </SelectCustomAntd>

                <InputCustomAntd
                  controller={{ control, name: `addresses.${index}.address1` }}
                  label={t("address.address1")}
                  placeholder={t("address.enterAddress1")}
                  errorMessage={errors?.addresses?.[index]?.address1?.message}
                  maxLength={200}
                />

                <InputCustomAntd
                  controller={{
                    control,
                    name: `addresses.${index}.description`,
                  }}
                  label={t("common.description")}
                  placeholder={t("placeholders.enterDescription")}
                  maxLength={400}
                />
              </div>

              <div className="flex flex-col justify-start w-1/2">
                <SelectCustomAntd<IAddress>
                  controller={{ control, name: `addresses.${index}.city` }}
                  errorMessage={errors?.addresses?.[index]?.city?.message}
                  label={t("address.city")}
                  placeholder={t("address.selectCity")}
                >
                  {stateCities
                    .find(
                      (stateCity: ICityMockData) =>
                        stateCity.stateCode === address.stateCode
                    )
                    ?.cities.map((city: string) => (
                      <Select.Option key={city} value={city}>
                        {city}
                      </Select.Option>
                    ))}
                </SelectCustomAntd>

                <InputCustomAntd
                  label={t("address.address2")}
                  controller={{ control, name: `addresses.${index}.address2` }}
                  placeholder={t("address.enterAddress2")}
                  maxLength={200}
                />

                <SelectCustomAntd<IAddress>
                  controller={{ control, name: `addresses.${index}.types` }}
                  label={t("address.types")}
                  errorMessage={errors?.addresses?.[index]?.types?.message}
                  placeholder={t("address.selectTypes")}
                  mode="multiple"
                >
                  {Object.keys(AddressEnum.Type).map((type: string) => (
                    <Select.Option key={type} value={type}>
                      {AddressEnum.TypesLabels[type as AddressEnum.Type]}
                    </Select.Option>
                  ))}
                </SelectCustomAntd>
              </div>
            </div>
          </Collapse>
        );
      })}
    </ContainerTitle>
  );
};
