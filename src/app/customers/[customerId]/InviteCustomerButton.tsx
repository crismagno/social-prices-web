"use client";

import { useEffect, useState } from "react";

import { App, Button, Tooltip } from "antd";
import moment from "moment";

import { SendOutlined } from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { ICustomer } from "../../../shared/business/customers/customer.interface";

interface Props {
  customer: ICustomer;
  size?: "small" | "middle" | "large";
}

// Invites the customer to follow their purchases with an account of their own.
export default function InviteCustomerButton({ customer, size }: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const [invitedAt, setInvitedAt] = useState<string | null>(
    customer.invitedAt ?? null,
  );

  const [isSending, setIsSending] = useState<boolean>(false);

  // A userId alone is not enough: the account it points to may be gone.
  const [hasAccount, setHasAccount] = useState<boolean>(
    customer.hasAccount ?? !!customer.userId,
  );

  // Customers from lists come without hasAccount: ask the API once.
  useEffect(() => {
    if (customer.hasAccount !== undefined || !customer.userId) {
      return;
    }

    serviceMethodsInstance.customersServiceMethods
      .findById(customer._id)
      .then((found: ICustomer | null) =>
        setHasAccount(found?.hasAccount ?? !!found?.userId),
      )
      .catch(() => undefined);
  }, [customer._id, customer.hasAccount, customer.userId]);

  const disabledReason: string | null = hasAccount
    ? t("customers.alreadyHasAccount")
    : !customer.email
      ? t("customers.inviteNeedsEmail")
      : null;

  const handleInvite = async (): Promise<void> => {
    try {
      setIsSending(true);

      const invited: ICustomer =
        await serviceMethodsInstance.customersServiceMethods.invite(
          customer._id,
        );

      setInvitedAt(invited.invitedAt ?? new Date().toISOString());

      setHasAccount(false);

      message.success(t("customers.invited"));
    } catch (error: any) {
      const code: string | undefined =
        error?.response?.data?.code ?? error?.response?.data?.error?.code;

      if (code === "CUSTOMER_ALREADY_HAS_ACCOUNT") {
        setHasAccount(true);
        message.warning(t("customers.alreadyHasAccount"));
      } else {
        handleClientError(error);
      }
    } finally {
      setIsSending(false);
    }
  };

  const tooltip: string =
    disabledReason ??
    (invitedAt
      ? t("customers.invitedAt").replace(
          "{date}",
          moment(invitedAt).format("DD/MM/YYYY"),
        )
      : t("customers.inviteTooltip"));

  return (
    <Tooltip title={tooltip}>
      <Button
        icon={<SendOutlined />}
        size={size}
        loading={isSending}
        disabled={!!disabledReason}
        onClick={handleInvite}
      >
        {invitedAt ? t("customers.inviteAgain") : t("customers.invite")}
      </Button>
    </Tooltip>
  );
}
