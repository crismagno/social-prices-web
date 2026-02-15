"use client";

import { useState } from 'react';

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
} from 'antd';
import moment from 'moment';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import {
  useParams,
  useRouter,
} from 'next/navigation';

import {
  BlockOutlined,
  EditOutlined,
  TagOutlined,
} from '@ant-design/icons';

import Avatar from '../../../components/common/Avatar/Avatar';
import ContainerTitle
  from '../../../components/common/ContainerTitle/ContainerTitle';
import Description from '../../../components/common/Description/Description';
import {
  DescriptionAddresses,
} from '../../../components/common/DescriptionAddresses/DescriptionAddresses';
import {
  DescriptionPhoneNumbers,
} from '../../../components/common/DescriptionPhoneNumbers/DescriptionPhoneNumbers';
import {
  IconAtSymbol,
  IconCake,
  IconIdentification,
  IconPencilSquare,
  IconQuestion,
  IconUser,
} from '../../../components/common/icons/icons';
import LoadingFull from '../../../components/common/LoadingFull/LoadingFull';
import {
  TagCategoriesCustomAntd,
} from '../../../components/common/TagCategoriesCustomAntd/TagCategoriesCustomAntd';
import {
  TagTagsCustomAntd,
} from '../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd';
import Layout from '../../../components/template/Layout/Layout';
import CategoriesEnum
  from '../../../shared/business/categories/categories.enum';
import StoresEnum from '../../../shared/business/stores/stores.enum';
import TagsEnum from '../../../shared/business/tags/tags.enum';
import Urls from '../../../shared/common/routes-app/routes-app';
import DatesEnum from '../../../shared/utils/dates/dates.enum';
import { getImageUrl } from '../../../shared/utils/images/images-url';
import ImagesEnum from '../../../shared/utils/images/images.enum';
import {
  useFindCategoriesByType,
} from '../../categories/useFindCategoriesByType';
import { SalesBalance } from '../../sales/components/SalesBalance/SalesBalance';
import { SalesChart } from '../../sales/components/SalesChart/SalesChart';
import {
  SalesChartsStatistics,
} from '../../sales/components/SalesChartsStatistics/SalesChartsStatistics';
import SalesTable from '../../sales/components/SalesTable/SalesTable';
import { useFindTagsByType } from '../../tags/useFindTagsByType';
import { useFindStoreById } from '../detail/useFindStoreById';

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
            className="flex flex-col justify-center items-center"
          >
            <Avatar
              onClick={() => setPreviewOpen(true)}
              src={store.logo}
              width={240}
              className="shadow-lg border-none cursor-pointer z-10"
              title="See avatar"
            />

            <h3 className="md:text-2xl font-semibold text-blueGray-700 mt-1">
              {store.name}
            </h3>

            <Tooltip title={"Store Email, click to send a email"}>
              <a
                href={`mailto:${store.email}`}
                className="flex items-center text-sm leading-normal text-gray-400 
                  font-bold px-2 py-1 shadow-sm rounded-lg border border-gray-300 mt-1
                  w-min"
              >
                {IconAtSymbol("w-3.5 h-3.5")}
                {store.email}
              </a>
            </Tooltip>
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
              <Row>
                <Col xs={24} md={12}>
                  <Description
                    label="Name"
                    description={`${store.name ?? "-"}`}
                    leftIcon={IconUser()}
                  />

                  <Description
                    label="Email"
                    description={store.email ?? ""}
                    leftIcon={IconAtSymbol()}
                  />

                  <Description
                    label="Cnpj / Cpf"
                    description={store.cnpj ?? ""}
                    leftIcon={IconIdentification()}
                  />

                  <Description
                    label="Started At"
                    leftIcon={IconCake()}
                    description={
                      store.startedAt
                        ? moment(store.startedAt).format(
                            DatesEnum.Format.DDMMYYY
                          )
                        : "-"
                    }
                  />

                  <Description
                    label="Status"
                    description={
                      <Tag color={StoresEnum.StatusColor[store.status]}>
                        {StoresEnum.StatusLabel[store.status]}
                      </Tag>
                    }
                    leftIcon={IconQuestion()}
                  />

                  <Description
                    label="Type"
                    description={
                      <Tag>
                        {
                          StoresEnum.TypeLabels[
                            store.type ?? StoresEnum.Type.OTHER
                          ]
                        }
                      </Tag>
                    }
                    leftIcon={IconQuestion()}
                  />
                </Col>

                <Col xs={24} md={12}>
                  <Description
                    label="Description"
                    description={store.description}
                    leftIcon={IconPencilSquare()}
                  />

                  <Description
                    label="About"
                    description={store.about}
                    leftIcon={IconPencilSquare()}
                  />

                  <DescriptionPhoneNumbers phoneNumbers={store.phoneNumbers} />

                  <DescriptionAddresses addresses={store.addresses} />

                  <Description
                    label="Categories"
                    description={
                      <div className="w-full flex">
                        <TagCategoriesCustomAntd
                          categories={categories}
                          useTag
                          categoriesIds={store.categoriesIds}
                        />
                      </div>
                    }
                    leftIcon={<BlockOutlined className="text-lg" />}
                  />

                  <Description
                    label="Tags"
                    description={
                      <div className="w-full flex">
                        <TagTagsCustomAntd
                          tags={tags}
                          useTag
                          tagsIds={store.tagsIds}
                        />
                      </div>
                    }
                    leftIcon={<TagOutlined className="text-lg" />}
                  />
                </Col>
              </Row>
            </ContainerTitle>
          </Col>
        </Row>
      </Card>

      <SalesBalance storeId={storeId} />

      <Collapse
        style={{ backgroundColor: "#fff", boxShadow: "none" }}
        ghost
        defaultActiveKey={["1"]}
        items={[
          {
            key: "1",
            forceRender: true,
            label: (
              <span className="font-semibold text-base">Sales Statistics</span>
            ),
            children: (
              <SalesChartsStatistics
                storeId={storeId}
                isShowHeaderLabel={false}
              />
            ),
          },
        ]}
      />

      <Collapse
        style={{ backgroundColor: "#fff", boxShadow: "none" }}
        ghost
        className="mt-2"
        items={[
          {
            key: "1",
            label: <span className="font-semibold text-base">Sales Chart</span>,
            children: <SalesChart isShowHeader={false} storeId={storeId} />,
          },
        ]}
      />

      <Row>
        <Col xs={24}>
          <SalesTable storeId={storeId} />
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
            store?.logo
              ? getImageUrl(store.logo)
              : ImagesEnum.FilesNames.DefaultAvatarImage
          }
        />
      </Modal>
    </Layout>
  );
}
