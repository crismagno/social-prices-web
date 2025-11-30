"use client";

import { useState } from "react";

import {
  Button,
  Card,
  Col,
  Collapse,
  Image,
  Modal,
  Row,
  Tag,
  Tooltip,
} from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useParams, useRouter } from "next/navigation";

import { EditOutlined, FileOutlined, TagOutlined } from "@ant-design/icons";

import Avatar from "../../../components/common/Avatar/Avatar";
import ContainerTitle from "../../../components/common/ContainerTitle/ContainerTitle";
import Description from "../../../components/common/Description/Description";
import { DescriptionAddresses } from "../../../components/common/DescriptionAddresses/DescriptionAddresses";
import { DescriptionPhoneNumbers } from "../../../components/common/DescriptionPhoneNumbers/DescriptionPhoneNumbers";
import {
  IconAtSymbol,
  IconCake,
  IconIdentification,
  IconPencilSquare,
  IconQuestion,
  IconUser,
} from "../../../components/common/icons/icons";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import { TagTagsCustomAntd } from "../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import Layout from "../../../components/template/Layout/Layout";
import PersonEnum from "../../../shared/business/shared/person/person.enum";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import ImagesEnum from "../../../shared/utils/images/images.enum";
import { SalesBalance } from "../../sales/components/SalesBalance/SalesBalance";
import { SalesChart } from "../../sales/components/SalesChart/SalesChart";
import SalesTable from "../../sales/components/SalesTable/SalesTable";
import { useFindTagsByType } from "../../tags/useFindTagsByType";
import { useFindCustomerById } from "../detail/useFindCustomerById";

export default function CustomerPage() {
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
      subtitle={`Here we can see about customer - ${customer.name}`}
      title="Customer"
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        <Row gutter={[4, 4]}>
          <Col
            xs={24}
            sm={10}
            md={5}
            className="flex flex-col justify-center items-center"
          >
            <Avatar
              onClick={() => setPreviewOpen(true)}
              src={customer.avatar}
              width={240}
              className="shadow-lg border-none cursor-pointer z-10"
              title="See avatar"
            />

            <h3 className="md:text-2xl font-semibold text-blueGray-700 mt-1">
              {customer.name}
            </h3>

            <Tooltip title={"Customer Email, click to send a email"}>
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center text-sm leading-normal text-gray-400 
                  font-bold px-2 py-1 shadow-sm rounded-lg border border-gray-300 mt-1
                  w-min"
              >
                {IconAtSymbol("w-3.5 h-3.5")}
                {customer.email}
              </a>
            </Tooltip>
          </Col>

          <Col xs={24} sm={14} md={19}>
            <ContainerTitle
              title="Information"
              extraHeader={
                <Tooltip title="Edit customer">
                  <Button
                    type="success"
                    icon={<EditOutlined />}
                    onClick={handleEditCustomer}
                  >
                    Edit
                  </Button>
                </Tooltip>
              }
            >
              <Row>
                <Col xs={24} md={12}>
                  <Description
                    label="Name"
                    description={`${customer.name ?? "-"}`}
                    leftIcon={IconUser()}
                  />

                  <Description
                    label="Uniq Name"
                    description={`${customer.uniqName ?? "-"}`}
                    leftIcon={IconIdentification()}
                  />

                  <Description
                    label="Email"
                    description={customer.email ?? "-"}
                    leftIcon={IconAtSymbol()}
                  />

                  <Description
                    label="Birth Date"
                    leftIcon={IconCake()}
                    description={
                      customer.birthDate
                        ? moment(customer.birthDate).format(
                            DatesEnum.Format.DDMMYYY
                          )
                        : "-"
                    }
                  />

                  <Description
                    label="Gender"
                    leftIcon={IconQuestion()}
                    description={
                      <Tag
                        color={
                          PersonEnum.GenderColors[
                            customer.gender ?? PersonEnum.Gender.OTHER
                          ]
                        }
                      >
                        {
                          PersonEnum.GenderLabels[
                            customer.gender ?? PersonEnum.Gender.OTHER
                          ]
                        }
                      </Tag>
                    }
                  />
                </Col>

                <Col xs={24} md={12}>
                  <Description
                    label="Tags"
                    description={
                      <div className="w-full flex">
                        <TagTagsCustomAntd
                          tags={tags}
                          useTag
                          tagsIds={customer.tagsIds}
                        />
                      </div>
                    }
                    leftIcon={<TagOutlined className="text-lg" />}
                  />

                  <DescriptionPhoneNumbers
                    phoneNumbers={customer.phoneNumbers}
                  />

                  <DescriptionAddresses addresses={customer.addresses} />

                  <Description
                    label="About"
                    description={customer.about}
                    leftIcon={IconPencilSquare()}
                  />

                  <Description
                    label="Upload Filename"
                    description={customer.uploadFilename}
                    leftIcon={<FileOutlined className="text-lg" />}
                  />
                </Col>
              </Row>
            </ContainerTitle>
          </Col>
        </Row>
      </Card>

      <SalesBalance customerId={customerId} />

      <Collapse
        style={{ backgroundColor: "#fff", boxShadow: "none" }}
        ghost
        items={[
          {
            key: "1",
            label: <span className="font-semibold text-base">Sales Chart</span>,
            children: (
              <SalesChart isShowHeader={false} customerId={customerId} />
            ),
          },
        ]}
      />

      <Row>
        <Col xs={24}>
          <SalesTable customerId={customerId} />{" "}
        </Col>
      </Row>

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
            customer?.avatar
              ? getImageUrl(customer.avatar)
              : ImagesEnum.FilesNames.DefaultAvatarImage
          }
        />
      </Modal>
    </Layout>
  );
}
