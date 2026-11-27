"use client";

import { useEffect, useState } from "react";

import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Skeleton,
  Tag,
} from "antd";

import { SearchOutlined, ShopOutlined } from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { ICustomerPortalSite } from "../../../shared/business/customer-portal/customer-portal.types";
import { sitePagePath } from "../../../shared/business/store-sites/store-site-pages";
import { getImageUrl } from "../../../shared/utils/images/images-url";

const KEY = "customerPortal.sites";

/** How long after the last key a search waits before asking. */
const SEARCH_DELAY_MS: number = 350;

/**
 * The sites of the stores that are online, for the customer to visit: each
 * opens in a new tab, where they see it and buy as any visitor does.
 */
export default function CustomerSitesPage() {
  const { t } = useLanguageData();

  const [typed, setTyped] = useState<string>("");

  const [search, setSearch] = useState<string>("");

  const [sites, setSites] = useState<ICustomerPortalSite[] | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(typed.trim()), SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [typed]);

  useEffect(() => {
    // An answer to an older search must not replace a newer one.
    let isCurrent: boolean = true;

    serviceMethodsInstance.customerPortalServiceMethods
      .findSites(search)
      .then((found: ICustomerPortalSite[]) => {
        if (isCurrent) {
          setSites(found);
        }
      })
      .catch((error: any) => {
        if (isCurrent) {
          setSites([]);
          handleClientError(error);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [search]);

  return (
    <Layout title={t(`${KEY}.title`)} subtitle={t(`${KEY}.subtitle`)}>
      <Card
        className="mt-5 overflow-hidden rounded-3xl shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        {/* The top of the card: what this is, how many there are, the search. */}
        <div className="flex flex-wrap items-center gap-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-white px-6 py-6 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 sm:px-8">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-600/30">
            <ShopOutlined />
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-xl font-semibold">{t(`${KEY}.heading`)}</h2>

            <p className="m-0 text-sm text-gray-500 dark:text-gray-400">
              {sites === null
                ? t(`${KEY}.subtitle`)
                : t(`${KEY}.count`).replace("{count}", String(sites.length))}
            </p>
          </div>

          <Input
            className="w-full sm:max-w-xs"
            size="large"
            allowClear
            maxLength={80}
            prefix={<SearchOutlined />}
            placeholder={t(`${KEY}.search`)}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
          />
        </div>

        <div className="min-h-[320px] px-6 py-6 sm:px-8 sm:py-8">
          {sites === null ? (
            <Skeleton active />
          ) : sites.length === 0 ? (
            <Empty
              description={t(search ? `${KEY}.noneFound` : `${KEY}.none`)}
            />
          ) : (
            <Row gutter={[16, 16]}>
              {sites.map((site: ICustomerPortalSite) => (
                <Col key={site.slug} xs={24} sm={12} lg={8} xxl={6}>
                  <a
                    href={sitePagePath(site.slug)}
                    target="_blank"
                    rel="noopener"
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-inherit no-underline shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
                  >
                    {/* Clipped here: the picture grows under the pointer, not over the words. */}
                    <div className="h-40 shrink-0 overflow-hidden">
                      <div
                        className="h-full bg-cover bg-center transition duration-500 group-hover:scale-105"
                        style={{
                          // Its own picture; without one, its own colour.
                          backgroundColor: site.color ?? "#6b7a5e",
                          backgroundImage: site.imageUrl
                            ? `url("${getImageUrl(site.imageUrl)}")`
                            : undefined,
                        }}
                      />
                    </div>

                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size={44}
                          className="shrink-0 -mt-10 border-2 border-white shadow dark:border-gray-900"
                          style={{ backgroundColor: site.color ?? undefined }}
                          src={site.logo ? getImageUrl(site.logo) : undefined}
                          icon={<ShopOutlined />}
                        />

                        <span className="min-w-0 flex-1 truncate text-base font-semibold">
                          {site.name}
                        </span>

                        {!site.sells && <Tag>{t(`${KEY}.onlyShows`)}</Tag>}
                      </div>

                      {site.title && (
                        <span className="line-clamp-1 font-medium">
                          {site.title}
                        </span>
                      )}

                      {site.subtitle && (
                        <span className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                          {site.subtitle}
                        </span>
                      )}

                      <Button type="primary" className="mt-auto" block>
                        {t(site.sells ? `${KEY}.visitAndBuy` : `${KEY}.visit`)}
                      </Button>
                    </div>
                  </a>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Card>
    </Layout>
  );
}
