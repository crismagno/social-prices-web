import React from "react";

import { IPhoneNumber } from "../../../shared/business/shared/phone/phone-number.interface";
import Description from "../Description/Description";
import { IconPhone } from "../icons/icons";
import { PhoneNumbersTag } from "../PhoneNumbersTag/PhoneNumbersTag";

interface Props {
  phoneNumbers: IPhoneNumber[];
  icon?: any;
}

export const DescriptionPhoneNumbers: React.FC<Props> = ({
  phoneNumbers,
  icon,
}) => {
  return (
    <Description
      label="Phone Numbers"
      className="overflow-x-auto"
      description={
        <div className="w-full flex">
          <PhoneNumbersTag phoneNumbers={phoneNumbers} />
        </div>
      }
      leftIcon={icon ?? IconPhone()}
    />
  );
};
