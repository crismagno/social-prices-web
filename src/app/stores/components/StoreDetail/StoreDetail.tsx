import { Card, Tag, Tooltip } from "antd";
import moment from "moment";

import Description from "../../../../components/common/Description/Description";
import {
  IconCake,
  IconPhone,
  IconQuestion,
} from "../../../../components/common/icons/icons";
import { IPhoneNumber } from "../../../../shared/business/interfaces/phone-number";
import StoresEnum from "../../../../shared/business/stores/stores.enum";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import DatesEnum from "../../../../shared/utils/dates/dates.enum";
import {
  createUserAddressName,
  messengersToString,
} from "../../../../shared/utils/string-extensions/string-extensions";

interface Props {
  store: IStore;
}

export const StoreDetail: React.FC<Props> = ({ store }) => {
  return (
    <Card title="Store Detail">
      <div className="flex flex-wrap">
        <div className="flex flex-col justify-start w-1/2">
          <Description
            label="Started At"
            leftIcon={IconCake()}
            description={
              store?.startedAt
                ? moment(store?.startedAt).format(DatesEnum.Format.MMDDYYYY)
                : "-"
            }
          />

          <Description
            label="Description"
            leftIcon={IconQuestion()}
            description={store.description}
          />
        </div>

        <div className="flex flex-col justify-start w-1/2">
          <Description
            label="Phone Numbers"
            className="overflow-x-auto"
            description={
              <div className="w-full flex">
                {store?.phoneNumbers?.length ? (
                  store?.phoneNumbers.map((phoneNumber: IPhoneNumber) => (
                    <Tooltip
                      key={phoneNumber.number}
                      title={messengersToString(phoneNumber.messengers)}
                    >
                      <Tag>
                        {StoresEnum.PhoneTypesLabels[phoneNumber.type]} -{" "}
                        {phoneNumber.number}
                      </Tag>
                    </Tooltip>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">-</span>
                )}
              </div>
            }
            leftIcon={IconPhone()}
          />

          <div className="flex items-start mt-4 ">
            <span className="mr-3">{IconQuestion()}</span>
            <div className={`flex flex-col overflow-x-auto`}>
              <label className="">Addresses</label>
              <div className="w-full overflow-x-auto flex">
                {store?.addresses?.length ? (
                  store?.addresses.map((address) => (
                    <Tag key={address.uid}>
                      {createUserAddressName(address)}
                    </Tag>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">-</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
