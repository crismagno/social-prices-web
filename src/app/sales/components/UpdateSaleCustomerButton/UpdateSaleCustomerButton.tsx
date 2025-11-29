import { useState } from "react";

import { Button, Col, Divider, Modal, Row, Select, Tooltip } from "antd";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { UserSwitchOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import handleClientError from "../../../../components/common/handleClientError/handleClientError";
import { ImageOrDefault } from "../../../../components/common/ImageOrDefault/ImageOrDefault";
import { SelectCustomAntd } from "../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import { ICustomer } from "../../../../shared/business/customers/customer.interface";
import { IAddress } from "../../../../shared/business/interfaces/address.interface";
import { ISale } from "../../../../shared/business/sales/sale.interface";
import { createAddressName } from "../../../../shared/utils/strings/string";
import { SelectCustomer } from "../../create/components/SelectCustomer/SelectCustomer";

const formSchema = z.object({
  newCustomerId: z.string().nonempty("New Customer is required!"),
  newAddressUid: z.string().optional().nullable(),
});

type TFormSchema = z.infer<typeof formSchema>;

interface Props {
  sale: ISale;
  onUpdatedSaleCustomer?: (sale: ISale) => void | Promise<void>;
}

export const UpdateSaleCustomerButton: React.FC<Props> = ({
  sale,
  onUpdatedSaleCustomer,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [newCustomer, setNewCustomer] = useState<ICustomer | null>(null);

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<TFormSchema>({
    values: {
      newCustomerId: "",
      newAddressUid: null,
    },
    resolver: zodResolver(formSchema),
  });

  if (!sale) {
    return null;
  }

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    try {
      setIsSubmitting(true);

      const response: ISale =
        await serviceMethodsInstance.salesServiceMethods.updateSaleCustomerManual(
          {
            saleId: sale._id,
            newAddressUid: data.newAddressUid!,
            newCustomerId: data.newCustomerId,
          }
        );

      onUpdatedSaleCustomer?.(response);
      setIsOpen(false);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectCustomer = (customer: ICustomer | null) => {
    setValue("newCustomerId", customer?._id ?? "");
    setValue("newAddressUid", null);

    setNewCustomer(customer);
  };

  const saleCustomer: ICustomer | undefined = sale.stores?.[0]?.customer;

  return (
    <>
      <Modal
        title={`Update Customer For Sale: ${sale.number}`}
        onCancel={() => setIsOpen(false)}
        onOk={handleSubmit(onSubmit)}
        open={isOpen}
        closable={false}
        maskClosable={false}
      >
        <Divider />

        <Row gutter={[8, 8]}>
          <Col xs={24} className="flex flex-col justify-center items-center">
            <label className="text-base mb-5">Current Customer</label>
            <Tooltip title="See avatar">
              <ImageOrDefault width={100} src={saleCustomer?.avatar} />
            </Tooltip>

            <label className="mt-2">{saleCustomer?.name}</label>

            <label className="text-xs mt-1">{saleCustomer?.email}</label>

            <label className="text-xs mt-1 text-center">
              {createAddressName(sale.buyer?.address)}
            </label>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[8, 8]}>
          <Col xs={24} className="flex flex-col justify-center items-center">
            <label className="text-base mb-5">New Customer</label>
            <Tooltip title="See avatar">
              <ImageOrDefault width={100} src={newCustomer?.avatar} />
            </Tooltip>

            <SelectCustomer
              onSelectCustomer={handleSelectCustomer}
              showNewCustomerOption={false}
              style={{ width: 400 }}
              selectProps={{ className: "mt-5 mb-5" }}
            />
            {errors.newCustomerId?.message && (
              <label className="text-sm text-red-500">
                {errors.newCustomerId?.message}
              </label>
            )}

            {newCustomer && (
              <SelectCustomAntd
                controller={{
                  control,
                  name: `newAddressUid`,
                }}
                errorMessage={errors?.newAddressUid?.message}
                placeholder={"Select address?"}
                style={{ width: 400 }}
                divClassName="mt-0"
              >
                {newCustomer?.addresses.map((address: IAddress) => (
                  <Select.Option key={address.uid} value={address.uid}>
                    <Tooltip title={createAddressName(address)}>
                      {createAddressName(address)}
                    </Tooltip>
                  </Select.Option>
                ))}
              </SelectCustomAntd>
            )}
          </Col>
        </Row>

        <Divider />
      </Modal>

      <Tooltip title="Update Customer on Sale">
        <Button
          type="default"
          loading={isSubmitting}
          disabled={isSubmitting || !sale}
          onClick={() => setIsOpen(true)}
          size="small"
          icon={<UserSwitchOutlined />}
        />
      </Tooltip>
    </>
  );
};
