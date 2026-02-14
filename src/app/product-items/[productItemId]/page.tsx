"use client";

import {
  Button,
  Card,
  Col,
  Descriptions,
  Image,
  Row,
  Tag,
} from 'antd';
import { find } from 'lodash';
import moment from 'moment';
import {
  useParams,
  useRouter,
} from 'next/navigation';

import { EditOutlined } from '@ant-design/icons';

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
import {
  ICategory,
} from '../../../shared/business/categories/categories.interface';
import TagsEnum from '../../../shared/business/tags/tags.enum';
import { ITag } from '../../../shared/business/tags/tags.interface';
import Urls from '../../../shared/common/routes-app/routes-app';
import { sortArray } from '../../../shared/utils/array/array-functions';
import DatesEnum from '../../../shared/utils/dates/dates.enum';
import { getImageUrl } from '../../../shared/utils/images/images-url';
import ImagesEnum from '../../../shared/utils/images/images.enum';
import { formatterMoney } from '../../../shared/utils/strings/string';
import {
  useFindCategoriesByType,
} from '../../categories/useFindCategoriesByType';
import { useFindProductsByUser } from '../../products/useFindProductsByUser';
import { useFindTagsByType } from '../../tags/useFindTagsByType';
import { useFindProductItemById } from '../useFindProductItemById';

export default function ProductItemPage() {
  const router = useRouter();
  const params = useParams();
  const productItemId = params.productItemId as string;

  const { productItem, isLoading } = useFindProductItemById(productItemId);

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.PRODUCT);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.PRODUCT
  );

  const { products, isLoading: isLoadingProducts } = useFindProductsByUser();

  if (isLoading || isLoadingCategories || isLoadingTags || isLoadingProducts) {
    return <LoadingFull />;
  }

  if (!productItem) {
    return (
      <Layout subtitle="Not Found" title="Product Item" hasBackButton>
        <Card>
          <p>Product item not found</p>
        </Card>
      </Layout>
    );
  }

  const categoriesSort: ICategory[] = sortArray(categories, "name");
  const tagsSort: ITag[] = sortArray(tags, "name");
  const product = find(products, { _id: productItem.productId });

  return (
    <Layout subtitle={productItem.name} title="Product Item" hasBackButton>
      <Card
        title="Product Item Information"
        className="mt-5"
        extra={
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() =>
              router.push(
                Urls.EDIT_PRODUCT_ITEM.replace(
                  ":productItemId",
                  productItem._id
                )
              )
            }
          >
            Edit
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            {productItem.filesUrl?.length > 0 ? (
              <Image.PreviewGroup>
                {productItem.filesUrl.map((fileUrl: string) => (
                  <Image
                    key={fileUrl}
                    width={200}
                    src={getImageUrl(fileUrl)}
                    alt={productItem.name}
                  />
                ))}
              </Image.PreviewGroup>
            ) : (
              <Image
                width={200}
                src={ImagesEnum.FilesNames.DefaultAvatarImage}
                alt={productItem.name}
              />
            )}
          </Col>

          <Col xs={24} md={16}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Name">
                {productItem.name}
              </Descriptions.Item>

              <Descriptions.Item label="Product">
                {product?.name ?? "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Brand">
                {productItem.brand ?? "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Barcode">
                {productItem.barcode ?? "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="SKU">
                {productItem.sku ?? "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Price">
                {formatterMoney(productItem.price)}
              </Descriptions.Item>

              <Descriptions.Item label="Quantity">
                <Tag color={productItem.quantity <= 0 ? "red" : "green"}>
                  {productItem.quantity}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Active">
                <Tag color={productItem.isActive ? "green" : "red"}>
                  {productItem.isActive ? "Yes" : "No"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Default">
                <Tag color={productItem.isDefault ? "blue" : "gray"}>
                  {productItem.isDefault ? "Yes" : "No"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Categories">
                <TagCategoriesCustomAntd
                  categories={categoriesSort}
                  categoriesIds={productItem.categoriesIds}
                />
              </Descriptions.Item>

              <Descriptions.Item label="Tags">
                <TagTagsCustomAntd
                  tags={tagsSort}
                  tagsIds={productItem.tagsIds}
                />
              </Descriptions.Item>

              <Descriptions.Item label="Colors">
                {productItem.colors?.map((color: string) => (
                  <Tag
                    key={color}
                    color={color}
                    style={{ marginRight: 4, marginBottom: 4 }}
                  >
                    {color}
                  </Tag>
                ))}
              </Descriptions.Item>

              <Descriptions.Item label="Release Date">
                {productItem.releaseDate
                  ? moment(productItem.releaseDate).format(
                      DatesEnum.Format.DDMMYYYYhhmmss
                    )
                  : "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Expiration Date">
                {productItem.expirationDate
                  ? moment(productItem.expirationDate).format(
                      DatesEnum.Format.DDMMYYYYhhmmss
                    )
                  : "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Description">
                {productItem.description ?? "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Created At">
                {moment(productItem.createdAt).format(
                  DatesEnum.Format.DDMMYYYYhhmmss
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Updated At">
                {moment(productItem.updatedAt).format(
                  DatesEnum.Format.DDMMYYYYhhmmss
                )}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {productItem.dimensions && (
          <Card title="Dimensions" className="mt-5">
            <Descriptions bordered column={3}>
              {productItem.dimensions.size && (
                <Descriptions.Item label="Size">
                  {productItem.dimensions.size}
                </Descriptions.Item>
              )}
              {productItem.dimensions.height && (
                <Descriptions.Item label="Height">
                  {productItem.dimensions.height}
                </Descriptions.Item>
              )}
              {productItem.dimensions.width && (
                <Descriptions.Item label="Width">
                  {productItem.dimensions.width}
                </Descriptions.Item>
              )}
              {productItem.dimensions.length && (
                <Descriptions.Item label="Length">
                  {productItem.dimensions.length}
                </Descriptions.Item>
              )}
              {productItem.dimensions.depth && (
                <Descriptions.Item label="Depth">
                  {productItem.dimensions.depth}
                </Descriptions.Item>
              )}
              {productItem.dimensions.diameter && (
                <Descriptions.Item label="Diameter">
                  {productItem.dimensions.diameter}
                </Descriptions.Item>
              )}
              {productItem.dimensions.thickness && (
                <Descriptions.Item label="Thickness">
                  {productItem.dimensions.thickness}
                </Descriptions.Item>
              )}
              {productItem.dimensions.volume && (
                <Descriptions.Item label="Volume">
                  {productItem.dimensions.volume}
                </Descriptions.Item>
              )}
              {productItem.dimensions.weight && (
                <Descriptions.Item label="Weight">
                  {productItem.dimensions.weight}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}
      </Card>
    </Layout>
  );
}
