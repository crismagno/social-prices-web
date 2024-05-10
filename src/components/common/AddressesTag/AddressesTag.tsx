import { Tag } from "antd";

import { IAddress } from "../../../shared/business/interfaces/address.interface";
import { createAddressName } from "../../../shared/utils/string-extensions/string-extensions";

interface Props {
  addresses: IAddress[];
}

export const AddressesTag: React.FC<Props> = ({ addresses }) => {
  if (!addresses.length) {
    return null;
  }

  return addresses.map((address: IAddress) => (
    <Tag key={address.uid}>{createAddressName(address)}</Tag>
  ));
};
