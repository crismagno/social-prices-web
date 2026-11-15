"use client";

import { useState } from "react";

import { Button, Tooltip } from "antd";
import Link from "next/link";

import { EnterOutlined } from "@ant-design/icons";

import { ImageOrDefault } from "../../../components/common/ImageOrDefault/ImageOrDefault";
import { PhoneNumbersTag } from "../../../components/common/PhoneNumbersTag/PhoneNumbersTag";
import { TagTagsCustomAntd } from "../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import TableCustomAntd2 from "../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import { IPhoneNumber } from "../../../shared/business/shared/phone/phone-number.interface";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import { createTableState } from "../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../shared/utils/table/table-state.interface";
import { useFindTagsByType } from "../../tags/useFindTagsByType";
import { useFindCustomersByStoreTableState } from "./useFindCustomersByStoreTableState";

interface Props {
  storeId: string;
}

// The customers of this store: picked by hand on the customer, or added by a sale here.
export default function StoreCustomersTable({ storeId }: Props) {
  const { t } = useLanguageData();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ICustomer> | undefined
  >(createTableState({ sort: { field: "name", order: "ascend" } }));

  const { customers, total, isLoading } = useFindCustomersByStoreTableState(
    storeId,
    tableStateRequest,
  );

  const { tags } = useFindTagsByType(TagsEnum.Type.CUSTOMER);

  return (
    <TableCustomAntd2<ICustomer>
      rowKey={"_id"}
      dataSource={customers}
      loading={isLoading}
      tableStateRequest={tableStateRequest}
      setTableStateRequest={setTableStateRequest}
      total={total}
      scroll={{ x: "max-content" }}
      columns={[
        {
          title: "#",
          dataIndex: "avatar",
          key: "avatar",
          align: "center",
          render: (avatar: string | null) => (
            <ImageOrDefault src={avatar} width={50} />
          ),
        },
        {
          title: t("common.name"),
          dataIndex: "name",
          key: "name",
          align: "center",
          sorter: true,
          render: (name: string | null) => name || "-",
        },
        {
          title: t("common.email"),
          dataIndex: "email",
          key: "email",
          align: "center",
          sorter: true,
          render: (email: string | null) => email || "-",
        },
        {
          title: t("profile.phoneNumbers"),
          dataIndex: "phoneNumbers",
          key: "phoneNumbers",
          align: "center",
          render: (phoneNumbers: IPhoneNumber[]) => (
            <PhoneNumbersTag phoneNumbers={phoneNumbers} />
          ),
        },
        {
          title: t("tags.title"),
          dataIndex: "tagsIds",
          key: "tagsIds",
          align: "center",
          render: (tagsIds: string[]) => (
            <TagTagsCustomAntd tags={tags} tagsIds={tagsIds} />
          ),
        },
        {
          title: t("common.actions"),
          dataIndex: "action",
          key: "action",
          align: "center",
          fixed: "right",
          render: (_: any, customer: ICustomer) => (
            <Tooltip title={t("customers.goToCustomer")}>
              <Link href={Urls.CUSTOMER.replace(":customerId", customer._id)}>
                <Button icon={<EnterOutlined />} />
              </Link>
            </Tooltip>
          ),
        },
      ]}
    />
  );
}
