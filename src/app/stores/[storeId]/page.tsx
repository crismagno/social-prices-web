"use client";

import { useState } from "react";

import {
  Button,
  Card,
  Col,
  Descriptions,
  Image,
  Modal,
  Row,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useParams, useRouter } from "next/navigation";

import { EditOutlined } from "@ant-design/icons";

import Avatar from "../../../components/common/Avatar/Avatar";
import ContainerTitle from "../../../components/common/ContainerTitle/ContainerTitle";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import { TagCategoriesCustomAntd } from "../../../components/common/TagCategoriesCustomAntd/TagCategoriesCustomAntd";
import { TagTagsCustomAntd } from "../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import Layout from "../../../components/template/Layout/Layout";
import CategoriesEnum from "../../../shared/business/categories/categories.enum";
import AddressEnum from "../../../shared/business/shared/address/address.enum";
import { IAddress } from "../../../shared/business/shared/address/address.interface";
import PhoneNumberEnum from "../../../shared/business/shared/phone/phone-number.enum";
import { IPhoneNumber } from "../../../shared/business/shared/phone/phone-number.interface";
import StoresEnum from "../../../shared/business/stores/stores.enum";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import ImagesEnum from "../../../shared/utils/images/images.enum";
import { useFindCategoriesByType } from "../../categories/useFindCategoriesByType";
import { SalesBalance } from "../../sales/components/SalesBalance/SalesBalance";
import { SalesChart } from "../../sales/components/SalesChart/SalesChart";
import { SalesChartsStatistics } from "../../sales/components/SalesChartsStatistics/SalesChartsStatistics";
import SalesTable from "../../sales/components/SalesTable/SalesTable";
import { useFindTagsByType } from "../../tags/useFindTagsByType";
import { useFindStoreById } from "../detail/useFindStoreById";

export default function StorePage() {
  const router: AppRouterInstance = useRouter();

  const params: Params = useParams();

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const { isLoadingStore, store } = useFindStoreById(params?.storeId);

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.STORE);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.STORE
  );

  if (isLoadingStore || !store || isLoadingCategories || isLoadingTags) {
    return <LoadingFull />;
  }

  const storeId: string = store._id;

  const handleEditStore = () => {
    router.push(Urls.EDIT_STORE.replace(":storeId", storeId));
  };

  return (
    <Layout
      subtitle={`Here we can see about store - ${store.name}`}
      title="Store"
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        <Row gutter={[4, 4]}>
          <Col
            xs={24}
            sm={10}
            md={5}
            className="flex flex-col justify-start items-center"
          >
            <Avatar
              onClick={() => setPreviewOpen(true)}
              src={store.logo}
              width={240}
              className="shadow-lg border-none cursor-pointer z-10 rounded-lg mt-10"
              title="See logo"
            />

            <h3 className="md:text-2xl font-semibold text-blueGray-700 mt-1 mb-1">
              {store.name}
            </h3>

            <Tooltip title={"Store Email, click to send a email"}>
              <a
                href={`mailto:${store.email}`}
                className="flex items-center text-sm leading-normal text-gray-400 
                  font-bold px-2 py-1 shadow-sm rounded-lg border border-gray-300 mt-1"
              >
                {store.email}
              </a>
            </Tooltip>

            <Tag color={StoresEnum.StatusColor[store.status]} className="mt-2">
              {StoresEnum.StatusLabel[store.status]}
            </Tag>
          </Col>

          <Col xs={24} sm={14} md={19}>
            <ContainerTitle
              title="Information"
              extraHeader={
                <Tooltip title="Edit store">
                  <Button
                    type="success"
                    icon={<EditOutlined />}
                    onClick={handleEditStore}
                  >
                    Edit
                  </Button>
                </Tooltip>
              }
            >
              <Row gutter={[16, 16]}>
                {/* Basic Information */}
                <Col xs={24}>
                  <Descriptions
                    bordered
                    column={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
                    size="small"
                  >
                    <Descriptions.Item label="Name" span={2}>
                      <span className="font-medium">{store.name}</span>
                    </Descriptions.Item>

                    <Descriptions.Item label="Type">
                      <Tag color="blue">
                        {
                          StoresEnum.TypeLabels[
                            store.type ?? StoresEnum.Type.OTHER
                          ]
                        }
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Email">
                      <a
                        href={`mailto:${store.email}`}
                        className="text-blue-600"
                      >
                        {store.email}
                      </a>
                    </Descriptions.Item>

                    <Descriptions.Item label="CNPJ / CPF">
                      <Tag color="purple">{store.cnpj || "-"}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Status">
                      <Tag color={StoresEnum.StatusColor[store.status]}>
                        {StoresEnum.StatusLabel[store.status]}
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Started At">
                      {store.startedAt
                        ? moment(store.startedAt).format(
                            DatesEnum.Format.DDMMYYY
                          )
                        : "-"}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                {/* Description & About */}
                {(store.description || store.about) && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      {store.description && (
                        <Descriptions.Item label="Description">
                          <div className="max-h-20 overflow-y-auto">
                            {store.description}
                          </div>
                        </Descriptions.Item>
                      )}

                      {store.about && (
                        <Descriptions.Item label="About">
                          <div className="max-h-20 overflow-y-auto">
                            {store.about}
                          </div>
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Col>
                )}

                {/* Phone Numbers */}
                {store.phoneNumbers && store.phoneNumbers.length > 0 && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Phone Numbers">
                        <div className="flex flex-col gap-2">
                          {store.phoneNumbers.map(
                            (phone: IPhoneNumber, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 flex-wrap"
                              >
                                <Tag color="blue">
                                  {PhoneNumberEnum.TypeLabels[phone.type]}
                                </Tag>
                                <a
                                  href={`tel:${phone.number}`}
                                  className="text-blue-600 font-medium"
                                >
                                  {phone.number}
                                </a>
                                {phone.messengers &&
                                  phone.messengers.length > 0 && (
                                    <div className="flex gap-1">
                                      {phone.messengers.map(
                                        (
                                          messenger: PhoneNumberEnum.PhoneNumberMessenger,
                                          messengerIndex: number
                                        ) => (
                                          <Tag
                                            key={messengerIndex}
                                            color="green"
                                          >
                                            {
                                              PhoneNumberEnum
                                                .PhoneNumberMessengerLabels[
                                                messenger
                                              ]
                                            }
                                          </Tag>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            )
                          )}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                )}

                {/* Addresses */}
                {store.addresses && store.addresses.length > 0 && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Addresses">
                        <div className="flex flex-col gap-3">
                          {store.addresses.map(
                            (address: IAddress, index: number) => (
                              <div
                                key={index}
                                className="border-l-4 border-green-500 pl-3 py-2 bg-gray-50 rounded"
                              >
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {address.types &&
                                    address.types.map(
                                      (
                                        type: AddressEnum.Type,
                                        typeIndex: number
                                      ) => (
                                        <Tag key={typeIndex} color="purple">
                                          {AddressEnum.TypesLabels[type]}
                                        </Tag>
                                      )
                                    )}
                                </div>
                                <div className="text-sm space-y-1">
                                  <div>
                                    <span className="font-medium">
                                      {address.address1}
                                    </span>
                                    {address.address2 && (
                                      <span>, {address.address2}</span>
                                    )}
                                  </div>
                                  <div className="text-gray-600">
                                    {address.district}, {address.city} -{" "}
                                    {address.state?.name}
                                  </div>
                                  <div className="text-gray-600">
                                    {address.zip} - {address.country?.name}
                                  </div>
                                  {address.description && (
                                    <div className="text-gray-500 italic">
                                      {address.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                )}

                {/* Categories & Tags */}
                <Col xs={24}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Categories">
                      <div className="max-w-full overflow-x-auto py-1">
                        <div className="flex flex-wrap gap-1">
                          <TagCategoriesCustomAntd
                            categories={categories}
                            useTag
                            categoriesIds={store.categoriesIds}
                          />
                        </div>
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item label="Tags">
                      <div className="max-w-full overflow-x-auto py-1">
                        <div className="flex flex-wrap gap-1">
                          <TagTagsCustomAntd
                            tags={tags}
                            useTag
                            tagsIds={store.tagsIds}
                          />
                        </div>
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                {/* Dates */}
                <Col xs={24}>
                  <Descriptions
                    bordered
                    column={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
                    size="small"
                  >
                    <Descriptions.Item label="Created At">
                      {store.createdAt
                        ? moment(store.createdAt).format(
                            DatesEnum.Format.DDMMYYYYhhmmss
                          )
                        : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Updated At">
                      {store.updatedAt
                        ? moment(store.updatedAt).format(
                            DatesEnum.Format.DDMMYYYYhhmmss
                          )
                        : "-"}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </ContainerTitle>
          </Col>
        </Row>
      </Card>

      <Card className="mt-4">
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Sales Chart",
              children: (
                <>
                  <SalesBalance storeId={storeId} />
                  <SalesChartsStatistics
                    storeId={storeId}
                    isShowHeaderLabel={false}
                  />
                  <SalesChart isShowHeader={false} storeId={storeId} />
                </>
              ),
            },
            {
              key: "2",
              label: "Sales Table",
              children: <SalesTable storeId={storeId} />,
            },
          ]}
        />
      </Card>

      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <Image
          alt="preview image"
          style={{ width: "100%" }}
          preview={false}
          src={
            store?.logo
              ? getImageUrl(store.logo)
              : ImagesEnum.FilesNames.DefaultAvatarImage
          }
        />
      </Modal>
    </Layout>
  );
}
