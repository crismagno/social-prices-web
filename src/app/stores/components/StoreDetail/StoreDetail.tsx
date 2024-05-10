import { Card } from "antd";
import moment from "moment";

import { AddressesTag } from "../../../../components/common/AddressesTag/AddressesTag";
import Description from "../../../../components/common/Description/Description";
import {
  IconCake,
  IconPhone,
  IconQuestion,
} from "../../../../components/common/icons/icons";
import { PhoneNumbersTag } from "../../../../components/common/PhoneNumbersTag/PhoneNumbersTag";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import DatesEnum from "../../../../shared/utils/dates/dates.enum";

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
                ? moment(store?.startedAt).format(DatesEnum.Format.DDMMYYY)
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
                <PhoneNumbersTag phoneNumbers={store.phoneNumbers} />
              </div>
            }
            leftIcon={IconPhone()}
          />

          <div className="flex items-start mt-4 ">
            <span className="mr-3">{IconQuestion()}</span>
            <div className={`flex flex-col overflow-x-auto`}>
              <label className="">Addresses</label>
              <div className="w-full overflow-x-auto flex">
                <AddressesTag addresses={store.addresses} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
