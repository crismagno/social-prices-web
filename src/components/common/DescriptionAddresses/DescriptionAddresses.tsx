import React from "react";

import { IAddress } from "../../../shared/business/interfaces/address.interface";
import { AddressesTag } from "../AddressesTag/AddressesTag";
import { IconQuestion } from "../icons/icons";

interface Props {
  addresses: IAddress[];
  icon?: any;
}

export const DescriptionAddresses: React.FC<Props> = ({ addresses, icon }) => {
  return (
    <div className="flex items-start mt-4 ">
      <span className="mr-3">{icon ?? IconQuestion()}</span>
      <div className={`flex flex-col overflow-x-auto`}>
        <label className="">Addresses</label>
        <div className="w-full overflow-x-auto flex">
          <AddressesTag addresses={addresses} />
        </div>
      </div>
    </div>
  );
};
