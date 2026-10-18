"use client";

import { useEffect, useState } from "react";

import { Empty, Input, List, Modal, Spin } from "antd";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { ICustomer } from "../../../shared/business/customers/customer.interface";

const SEARCH_DELAY_MS: number = 300;
const RESULTS: number = 10;

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (customer: ICustomer) => void;
}

// Finds one of the user's customers by name or e-mail, with the same search the
// customers table uses.
export default function LinkCustomerModal({ open, onClose, onPick }: Props) {
  const { t } = useLanguageData();

  const [search, setSearch] = useState<string>("");

  const [customers, setCustomers] = useState<ICustomer[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isCancelled: boolean = false;

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);

        const response =
          await serviceMethodsInstance.customersServiceMethods.findByOwnerUserTableState(
            {
              search: search.trim() || undefined,
              pagination: { current: 1, pageSize: RESULTS },
              sort: { field: "name", order: "ascend" },
            },
          );

        if (!isCancelled) {
          setCustomers(response.data);
        }
      } catch (error: any) {
        if (!isCancelled) {
          handleClientError(error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, SEARCH_DELAY_MS);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [open, search]);

  return (
    <Modal
      open={open}
      title={t("apps.telegram.customer.linkTitle")}
      footer={null}
      onCancel={onClose}
      destroyOnClose
    >
      <Input
        allowClear
        autoFocus
        placeholder={t("apps.telegram.customer.linkSearch")}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="mt-3 max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <Spin />
          </div>
        ) : customers.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("apps.telegram.customer.linkEmpty")}
          />
        ) : (
          <List
            dataSource={customers}
            renderItem={(customer: ICustomer) => (
              <List.Item
                className="cursor-pointer"
                onClick={() => onPick(customer)}
              >
                <List.Item.Meta
                  title={customer.name}
                  description={customer.email}
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </Modal>
  );
}
