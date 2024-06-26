import { Select, Tooltip } from "antd";
import { useFieldArray } from "react-hook-form";
import { z } from "zod";

import AddressEnum from "../../../shared/business/enums/address.enum";
import { IAddress } from "../../../shared/business/interfaces/address.interface";
import citiesMockData from "../../../shared/utils/mock-data/brazil-cities.json";
import statesMockData from "../../../shared/utils/mock-data/brazil-states.json";
import countriesMockData from "../../../shared/utils/mock-data/countries.json";
import {
  ICityMockData,
  ICountryMockData,
  IStateMockData,
} from "../../../shared/utils/mock-data/interfaces";
import { createAddressName } from "../../../shared/utils/string-extensions/string-extensions";
import { SelectCustomAntd } from "../../custom/antd/SelectCustomAntd/SelectCustomAntd";
import ButtonCommon from "../ButtonCommon/ButtonCommon";
import Collapse from "../Collapse/Collapse";
import ContainerTitle from "../ContainerTitle/ContainerTitle";
import FormInput from "../FormInput/FormInput";
import { IconPlus, IconTrash } from "../icons/icons";

export const countries: ICountryMockData[] = countriesMockData.filter(
  (country) => country.code === "BR"
);

export const states: IStateMockData[] = statesMockData;

export const stateCities: ICityMockData[] = citiesMockData.states;

export const addressFormSchema = z.object({
  address1: z.string().nonempty("Address1 is required"),
  address2: z.string().nullable(),
  city: z.string().nonempty("City is required"),
  isValid: z.boolean(),
  stateCode: z.string().nonempty("State is required"),
  uid: z.string(),
  zip: z.string().nonempty("Zipcode is required"),
  description: z.string().nullable(),
  countryCode: z.string().nonempty("Country is required"),
  district: z.string().nonempty("District is required"),
  isCollapsed: z.boolean(),
  types: z.array(z.string()),
});

export type TAddressFormSchema = z.infer<typeof addressFormSchema>;

interface Props {
  control: any;
  watch: any;
  register: any;
  errors: any;
  containerExtraHeader?: any;
}

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

export const Addresses: React.FC<Props> = ({
  control,
  watch,
  register,
  errors,
  containerExtraHeader,
}) => {
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
          <label className="mr-4">Addresses</label>

          <Tooltip title="Add a new address">
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
            title={addressName.trim() || `Address (${index + 1})`}
            className="relative mt-5"
            extraHeader={
              <Tooltip title="Remove address">
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
                  label="Country"
                  placeholder={"Select country"}
                >
                  {countries.map((country: ICountryMockData) => (
                    <Select.Option key={country.code} value={country.code}>
                      {country.name}
                    </Select.Option>
                  ))}
                </SelectCustomAntd>

                <FormInput
                  label="Zipcode"
                  placeholder={"Enter zipcode"}
                  defaultValue={formAddress.zip}
                  register={register}
                  registerName={`addresses.${index}.zip`}
                  registerOptions={{ required: true }}
                  errorMessage={errors?.addresses?.[index]?.zip?.message}
                  maxLength={20}
                />

                <FormInput
                  label="District"
                  placeholder={"Enter district"}
                  defaultValue={formAddress.district}
                  register={register}
                  registerName={`addresses.${index}.district`}
                  registerOptions={{ required: true }}
                  errorMessage={errors?.addresses?.[index]?.district?.message}
                  maxLength={200}
                />
              </div>

              <div className="flex flex-col justify-start w-1/2">
                <SelectCustomAntd<IAddress>
                  controller={{ control, name: `addresses.${index}.stateCode` }}
                  errorMessage={errors?.addresses?.[index]?.stateCode?.message}
                  label="State"
                  placeholder={"Select state"}
                >
                  {states.map((state: IStateMockData) => (
                    <Select.Option key={state.code} value={state.code}>
                      {state.name}
                    </Select.Option>
                  ))}
                </SelectCustomAntd>

                <FormInput
                  label="Address 1"
                  placeholder={"Enter address 1"}
                  defaultValue={formAddress.address1}
                  register={register}
                  registerName={`addresses.${index}.address1`}
                  registerOptions={{ required: true }}
                  errorMessage={errors?.addresses?.[index]?.address1?.message}
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
                <SelectCustomAntd<IAddress>
                  controller={{ control, name: `addresses.${index}.city` }}
                  errorMessage={errors?.addresses?.[index]?.city?.message}
                  label="City"
                  placeholder={"Select city"}
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

                <FormInput
                  label="Address 2"
                  placeholder={"Enter address 2"}
                  defaultValue={formAddress.address2}
                  register={register}
                  registerName={`addresses.${index}.address2`}
                  maxLength={200}
                />

                <SelectCustomAntd<IAddress>
                  controller={{ control, name: `addresses.${index}.types` }}
                  label="Types"
                  errorMessage={errors?.addresses?.[index]?.types?.message}
                  placeholder={"Select types"}
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
