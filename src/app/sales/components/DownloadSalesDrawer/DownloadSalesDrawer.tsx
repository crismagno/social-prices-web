import { useState } from "react";

import { Button, Card, Col, Drawer, Row, Select } from "antd";
import { map } from "lodash";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { DownloadOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import { CustomRangeDatePicker } from "../../../../components/common/CustomRangeDatePicker/CustomRangeDatePicker";
import handleClientError from "../../../../components/common/handleClientError/handleClientError";
import { LabelBadgeCustomAntd } from "../../../../components/common/LabelBadgeCustomAntd/LabelBadgeCustomAntd";
import SelectProducts from "../../../../components/common/SelectProducts/SelectProducts";
import { TagTagCustomAntd } from "../../../../components/common/TagTagCustomAntd/TagTagCustomAntd";
import { InputCustomAntd } from "../../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import { IProduct } from "../../../../shared/business/products/products.interface";
import SalesEnum from "../../../../shared/business/sales/sales.enum";
import { IFiltersDownloadSales } from "../../../../shared/business/sales/sales.type";
import StoresEnum from "../../../../shared/business/stores/stores.enum";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import TableStateEnum from "../../../../shared/utils/table/table-state.enum";

const formSchema = z.object({
  search: z.string().nullable(),
  tagsIds: z.array(z.string()),
  types: z.array(z.string()),
  deliveryTypes: z.array(z.string()),
  status: z.array(z.string()),
  paymentStatus: z.array(z.string()),
  storeIds: z.array(z.string()),
  selectedProductIds: z.array(z.string()),
  sortField: z.string().nullable(),
  sortOrder: z.string().nullable(),
  rangeCreatedDate: z
    .object({
      startDate: z.date().nullable(),
      endDate: z.date().nullable(),
    })
    .nullable(),
});

type TFormSchema = z.infer<typeof formSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  width?: string | number;
  tags: ITag[];
  stores: IStore[];
}

export const DownloadSalesDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  width = "50%",
  tags = [],
  stores = [],
}) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<TFormSchema>({
    values: {
      search: null,
      tagsIds: [],
      types: [],
      rangeCreatedDate: null,
      selectedProductIds: [],
      deliveryTypes: [],
      status: [],
      paymentStatus: [],
      storeIds: [],
      sortField: SalesEnum.SortField.createdAt,
      sortOrder: TableStateEnum.SortOrder.ascend,
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    try {
      setIsDownloading(true);

      const response: Buffer =
        await serviceMethodsInstance.salesServiceMethods.downloadSales(
          data as IFiltersDownloadSales
        );

      const url: string = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "fileDownloadSales.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Drawer title={title} onClose={onClose} open={isOpen} width={width}>
      <Card title="Filters">
        <Row gutter={[8, 8]}>
          <Col xs={24} sm={24}>
            <InputCustomAntd
              controller={{ control, name: "search" }}
              label="Search"
              placeholder={"Search sales..."}
              errorMessage={errors.search?.message}
              maxLength={200}
              allowClear
            />
          </Col>

          <Col xs={24} sm={12}>
            <CustomRangeDatePicker
              label="Created At:"
              showTime
              labelClassName="font-normal"
              onChange={(startDate: Date | null, endDate: Date | null) => {
                setValue(
                  "rangeCreatedDate",
                  startDate === null || endDate === null
                    ? null
                    : { startDate, endDate }
                );
              }}
            />
          </Col>

          <Col xs={24} sm={12}>
            <SelectProducts
              label="Products"
              labelClassName="font-normal"
              selectedProductIds={watch("selectedProductIds")}
              onSelectProducts={(selectProducts: IProduct[]) =>
                setValue("selectedProductIds", map(selectProducts, "_id"))
              }
            />
          </Col>

          <Col xs={24} sm={6}>
            <SelectCustomAntd
              controller={{ control, name: "types" }}
              label="Types"
              errorMessage={errors.types?.message}
              placeholder={"Select types"}
              mode="multiple"
              allowClear
            >
              {Object.keys(SalesEnum.Type).map((type: string) => (
                <Select.Option
                  key={`download-filter-sales-type-${type}`}
                  value={type}
                >
                  {SalesEnum.TypeLabels[type as SalesEnum.Type]}
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={6}>
            <SelectCustomAntd
              controller={{ control, name: "deliveryTypes" }}
              label="Delivery Types"
              errorMessage={errors.deliveryTypes?.message}
              placeholder={"Select delivery types"}
              mode="multiple"
              allowClear
            >
              {Object.keys(SalesEnum.DeliveryType).map(
                (deliveryType: string) => (
                  <Select.Option
                    key={`download-filter-sales-delivery-type-${deliveryType}`}
                    value={deliveryType}
                  >
                    {
                      SalesEnum.DeliveryTypeLabels[
                        deliveryType as SalesEnum.DeliveryType
                      ]
                    }
                  </Select.Option>
                )
              )}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={6}>
            <SelectCustomAntd
              controller={{ control, name: "status" }}
              label="Status"
              errorMessage={errors.status?.message}
              placeholder={"Select status"}
              mode="multiple"
              allowClear
            >
              {Object.keys(SalesEnum.Status).map((status: string) => (
                <Select.Option
                  key={`download-filter-sales-status-${status}`}
                  value={status}
                >
                  <LabelBadgeCustomAntd
                    label={SalesEnum.StatusLabels[status as SalesEnum.Status]}
                    color={SalesEnum.StatusColors[status as SalesEnum.Status]}
                  />
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={6}>
            <SelectCustomAntd
              controller={{ control, name: "paymentStatus" }}
              label="Payment Status"
              errorMessage={errors.paymentStatus?.message}
              placeholder={"Select payment status"}
              mode="multiple"
              allowClear
            >
              {Object.keys(SalesEnum.PaymentStatus).map(
                (paymentStatus: string) => (
                  <Select.Option
                    key={`download-filter-sales-payment-status-${paymentStatus}`}
                    value={paymentStatus}
                  >
                    <LabelBadgeCustomAntd
                      label={
                        SalesEnum.PaymentStatusLabels[
                          paymentStatus as SalesEnum.PaymentStatus
                        ]
                      }
                      color={
                        SalesEnum.PaymentStatusColors[
                          paymentStatus as SalesEnum.PaymentStatus
                        ]
                      }
                    />
                  </Select.Option>
                )
              )}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={12}>
            <SelectCustomAntd
              controller={{ control, name: "storeIds" }}
              label="Stores"
              errorMessage={errors.storeIds?.message}
              placeholder={"Select stores"}
              mode="multiple"
              allowClear
            >
              {stores.map((store: IStore) => (
                <Select.Option
                  key={`download-filter-sales-store-${store._id}`}
                  value={store._id}
                >
                  <LabelBadgeCustomAntd
                    label={store.name}
                    color={StoresEnum.StatusBadgeColor[store.status]}
                  />
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={12}>
            <SelectCustomAntd
              controller={{ control, name: "tagsIds" }}
              label="Tags"
              errorMessage={errors.tagsIds?.message}
              placeholder={"Select tags"}
              mode="multiple"
              allowClear
            >
              {tags.map((tag: ITag) => (
                <Select.Option key={tag._id} value={tag._id}>
                  <TagTagCustomAntd tag={tag} useTag={false} />
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={12}>
            <SelectCustomAntd
              controller={{ control, name: "sortField" }}
              label="Sort Field"
              errorMessage={errors.sortField?.message}
              placeholder={"Select sort field"}
            >
              {Object.keys(SalesEnum.SortField).map((sortField: string) => (
                <Select.Option key={sortField} value={sortField}>
                  {SalesEnum.SortFieldLabels[sortField as SalesEnum.SortField]}
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24} sm={12}>
            <SelectCustomAntd
              controller={{ control, name: "sortOrder" }}
              label="Sort Order"
              errorMessage={errors.sortField?.message}
              placeholder={"Select sort order"}
            >
              {Object.keys(TableStateEnum.SortOrder).map(
                (sortOrder: string) => (
                  <Select.Option key={sortOrder} value={sortOrder}>
                    {
                      TableStateEnum.SortOrderLabels[
                        sortOrder as TableStateEnum.SortOrder
                      ]
                    }
                  </Select.Option>
                )
              )}
            </SelectCustomAntd>
          </Col>
        </Row>
      </Card>

      <Button
        type="primary"
        onClick={handleSubmit(onSubmit)}
        icon={<DownloadOutlined />}
        className="mt-3 block w-full"
        loading={isDownloading}
        disabled={isDownloading}
      >
        Download
      </Button>
    </Drawer>
  );
};
