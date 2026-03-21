"use client";

import { useState } from 'react';

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
} from 'antd';
import moment from 'moment';
import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import {
  useParams,
  useRouter,
} from 'next/navigation';

import { EditOutlined } from '@ant-design/icons';

import Avatar from '../../../components/common/Avatar/Avatar';
import ContainerTitle
  from '../../../components/common/ContainerTitle/ContainerTitle';
import LoadingFull from '../../../components/common/LoadingFull/LoadingFull';
import {
  TagTagsCustomAntd,
} from '../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd';
import Layout from '../../../components/template/Layout/Layout';
import useLanguageData from '../../../data/context/language/useLanguageData';
import AddressEnum from '../../../shared/business/shared/address/address.enum';
import {
  IAddress,
} from '../../../shared/business/shared/address/address.interface';
import PersonEnum from '../../../shared/business/shared/person/person.enum';
import PhoneNumberEnum
  from '../../../shared/business/shared/phone/phone-number.enum';
import {
  IPhoneNumber,
} from '../../../shared/business/shared/phone/phone-number.interface';
import TagsEnum from '../../../shared/business/tags/tags.enum';
import Urls from '../../../shared/common/routes-app/routes-app';
import DatesEnum from '../../../shared/utils/dates/dates.enum';
import { getImageUrl } from '../../../shared/utils/images/images-url';
import ImagesEnum from '../../../shared/utils/images/images.enum';
import { SalesBalance } from '../../sales/components/SalesBalance/SalesBalance';
import { SalesChart } from '../../sales/components/SalesChart/SalesChart';
import SalesTable from '../../sales/components/SalesTable/SalesTable';
import { useFindTagsByType } from '../../tags/useFindTagsByType';
import { useFindCustomerById } from '../detail/useFindCustomerById';

export default function CustomerPage() {
  const { t } = useLanguageData()!;
  const router: AppRouterInstance = useRouter();

  const params: Params = useParams();

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const paramsCustomerId: string = params?.customerId;

  const { isLoading, customer } = useFindCustomerById(paramsCustomerId);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.CUSTOMER
  );

  if (isLoading || !customer || isLoadingTags) {
    return <LoadingFull />;
  }

  const customerId: string = customer._id;

  const handleEditCustomer = () => {
    router.push(Urls.EDIT_CUSTOMER.replace(":customerId", customerId));
  };

  return (
    <Layout
      subtitle={`${t("customers.customerProfileSubtitle")} - ${customer.name}`}
      title={t("customers.customerProfile")}
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
              src={customer.avatar}
              width={240}
              className="shadow-lg border-none cursor-pointer z-10 rounded-lg mt-10"
              title={t("profile.seeAvatar")}
            />

            <h3 className="md:text-2xl font-semibold text-blueGray-700 mt-1 mb-1">
              {customer.name}
            </h3>

            <Tooltip title={t("customers.customerEmailTooltip")}>
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center text-sm leading-normal text-gray-400 
                  font-bold px-2 py-1 shadow-sm rounded-lg border border-gray-300 mt-1"
              >
                {customer.email}
              </a>
            </Tooltip>

            {customer.uniqName && (
              <Tooltip title={t("customers.uniqueUsername")}>
                <Tag color="blue" className="mt-2">
                  {customer.uniqName}
                </Tag>
              </Tooltip>
            )}
          </Col>

          <Col xs={24} sm={14} md={19}>
            <ContainerTitle
              title={t("profile.information")}
              extraHeader={
                <Tooltip title={t("customers.editCustomer")}>
                  <Button
                    type="success"
                    icon={<EditOutlined />}
                    onClick={handleEditCustomer}
                  >
                    {t("common.edit")}
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
                    <Descriptions.Item label={t("common.name")} span={2}>
                      <span className="font-medium">{customer.name}</span>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("customers.uniqName")}>
                      <Tag color="blue">{customer.uniqName || "-"}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("common.email")}>
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-blue-600"
                      >
                        {customer.email}
                      </a>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("customers.birthDate")}>
                      {customer.birthDate
                        ? moment(customer.birthDate).format(
                            DatesEnum.Format.DDMMYYY
                          )
                        : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label={t("customers.gender")}>
                      <Tag
                        color={
                          PersonEnum.GenderColors[
                            customer.gender ?? PersonEnum.Gender.OTHER
                          ]
                        }
                      >
                        {t(PersonEnum.GenderLabels[customer.gender ?? PersonEnum.Gender.OTHER])}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                {/* About */}
                {customer.about && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label={t("customers.about")}>
                        <div className="max-h-20 overflow-y-auto">
                          {customer.about}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                )}

                {/* Phone Numbers */}
                {customer.phoneNumbers && customer.phoneNumbers.length > 0 && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label={t("profile.phoneNumbers")}>
                        <div className="flex flex-col gap-2">
                          {customer.phoneNumbers.map(
                            (phone: IPhoneNumber, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 flex-wrap"
                              >
                                <Tag color="blue">
                                  {t(PhoneNumberEnum.TypeLabels[phone.type])}
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
                                            {t(PhoneNumberEnum.PhoneNumberMessengerLabels[messenger])}
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
                {customer.addresses && customer.addresses.length > 0 && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label={t("profile.addresses")}>
                        <div className="flex flex-col gap-3">
                          {customer.addresses.map(
                            (address: IAddress, index: number) => (
                              <div
                                key={index}
                                className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50 rounded"
                              >
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {address.types &&
                                    address.types.map(
                                      (
                                        type: AddressEnum.Type,
                                        typeIndex: number
                                      ) => (
                                        <Tag key={typeIndex} color="purple">
                                          {t(AddressEnum.TypesLabels[type])}
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

                {/* Tags */}
                <Col xs={24}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label={t("tags.title")}>
                      <div className="max-w-full overflow-x-auto py-1">
                        <div className="flex flex-wrap gap-1">
                          <TagTagsCustomAntd
                            tags={tags}
                            useTag
                            tagsIds={customer.tagsIds}
                          />
                        </div>
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                {/* Dates & Upload Info */}
                <Col xs={24}>
                  <Descriptions
                    bordered
                    column={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
                    size="small"
                  >
                    {customer.uploadFilename && (
                      <Descriptions.Item label={t("customers.uploadFilename")}>
                        <Tag color="orange">{customer.uploadFilename}</Tag>
                      </Descriptions.Item>
                    )}

                    <Descriptions.Item label={t("profile.createdAt")}>
                      {customer.createdAt
                        ? moment(customer.createdAt).format(
                            DatesEnum.Format.DDMMYYYYhhmmss
                          )
                        : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label={t("profile.updatedAt")}>
                      {customer.updatedAt
                        ? moment(customer.updatedAt).format(
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
              label: t("sales.salesChart"),
              children: (
                <>
                  <SalesBalance customerId={customerId} />
                  <SalesChart isShowHeader={false} customerId={customerId} />
                </>
              ),
            },
            {
              key: "2",
              label: t("sales.salesTable"),
              children: <SalesTable customerId={customerId} />,
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
          alt={t("common.previewImage")}
          style={{ width: "100%" }}
          preview={false}
          src={
            customer?.avatar
              ? getImageUrl(customer.avatar)
              : ImagesEnum.FilesNames.DefaultAvatarImage
          }
        />
      </Modal>
    </Layout>
  );
}
