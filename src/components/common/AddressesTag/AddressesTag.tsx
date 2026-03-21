import { Tag } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { IAddress } from "../../../shared/business/shared/address/address.interface";
import { createAddressName } from "../../../shared/utils/strings/string";

interface Props {
  addresses: IAddress[];
}

export const AddressesTag: React.FC<Props> = ({ addresses }) => {
  const { t } = useLanguageData();

  if (!addresses.length) {
    return null;
  }

  return addresses.map((address: IAddress) => (
    <Tag key={address.uid}>{createAddressName(address, t)}</Tag>
  ));
};
