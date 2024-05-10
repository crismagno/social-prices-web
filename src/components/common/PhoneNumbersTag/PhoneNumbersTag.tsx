import { Tag, Tooltip } from "antd";

import { IPhoneNumber } from "../../../shared/business/interfaces/phone-number";
import UsersEnum from "../../../shared/business/users/users.enum";
import { messengersToString } from "../../../shared/utils/string-extensions/string-extensions";

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
        UsersEnum.TypeLabels[phoneNumber.type]
      } - ${phoneNumber.number}`}</Tag>
    </Tooltip>
  ));
};
