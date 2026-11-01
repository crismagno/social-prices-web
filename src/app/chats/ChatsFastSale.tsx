"use client";

import { FastSaleDrawer } from "../../components/common/FastSaleDrawer/FastSaleDrawer";
import { useFindCustomerById } from "../customers/detail/useFindCustomerById";

interface Props {
  customerId: string;
  onClose: () => void;
}

// The fast sale for the customer of the open chat. The drawer takes the whole
// customer, so it is mounted only once that is loaded, and only while it is open.
export default function ChatsFastSale({ customerId, onClose }: Props) {
  const { customer } = useFindCustomerById(customerId);

  if (!customer) {
    return null;
  }

  return <FastSaleDrawer open onClose={onClose} initialCustomer={customer} />;
}
