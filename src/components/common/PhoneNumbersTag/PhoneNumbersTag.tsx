import { Tag, Tooltip } from "antd";

import PhoneNumberEnum from "../../../shared/business/enums/phone-number.enum";
import { IPhoneNumber } from "../../../shared/business/interfaces/phone-number.interface";
import { messengersToString } from "../../../shared/utils/strings/string-extensions";

interface Props {
  phoneNumbers: IPhoneNumber[];
}

export const PhoneNumbersTag: React.FC<Props> = ({ phoneNumbers }) => {
  if (!phoneNumbers.length) {
    return null;
  }

  return phoneNumbers.map((phoneNumber: IPhoneNumber) => (
    <Tooltip
      key={phoneNumber.number}
      title={messengersToString(phoneNumber.messengers)}
    >
      <Tag key={phoneNumber.number}>{`${
        PhoneNumberEnum.TypeLabels[phoneNumber.type]
      } - ${phoneNumber.number}`}</Tag>
    </Tooltip>
  ));
};
