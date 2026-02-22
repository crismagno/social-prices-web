"use client";

import { useEffect, useState } from "react";

import { Divider, Empty, Tooltip } from "antd";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/dist/client/components/navigation";

import Avatar from "../../../../components/common/Avatar/Avatar";
import handleClientError from "../../../../components/common/HandleClientError/HandleClientError";
import LoadingFull from "../../../../components/common/LoadingFull/LoadingFull";
import { Logo1 } from "../../../../components/common/Logo/Logo1";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import { ICustomer } from "../../../../shared/business/customers/customer.interface";
import { ISale } from "../../../../shared/business/sales/sale.interface";
import Urls from "../../../../shared/common/routes-app/routes-app";

export default function DownloadSalesSummaryPage() {
  const router = useRouter();

  const searchParams: ReadonlyURLSearchParams = useSearchParams();

  const token: string | null = searchParams.get("i");

  const [sale, setSale] = useState<ISale | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      const fetchGetSaleBySaleSummaryLinkToken = async () => {
        try {
          setIsLoading(true);

          const response: ISale =
            await serviceMethodsInstance.salesServiceMethods.getSaleBySaleSummaryLinkToken(
              token
            );

          setSale(response);
        } catch (error) {
          handleClientError(error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchGetSaleBySaleSummaryLinkToken();
    }
  }, [token]);

  if (isLoading) {
    return <LoadingFull />;
  }

  if (!sale) {
    return (
      <div
        className="w-screen h-screen flex flex-col justify-center items-center 
          bg-gradient-to-r from-gray-200 to-sky-100"
      >
        <div
          className="flex items-center justify-center lg:w-1/2 md:w-1/2 w-full h-1/2 
           p-3 shadow-2xl bg-white rounded-lg"
        >
          <Empty />
        </div>

        <footer>
          <Logo1 size={50} />
        </footer>
      </div>
    );
  }

  const customer: ICustomer | undefined = sale.stores?.[0].customer;

  return (
    <div
      className="w-screen h-screen flex flex-col justify-center items-center 
    bg-gradient-to-r from-gray-200 to-sky-100"
    >
      <div
        className="flex items-center justify-center lg:w-1/4 md:w-1/2 h-1/2 
        p-3 shadow-2xl bg-white rounded-lg"
      >
        <div
          className="flex flex-col justify-start items-center h-full w-1/2
          "
        >
          <label className="text-lg mt-10">
            Sale Summary: {sale.number ?? "N/A"}
          </label>

          <Avatar
            src={customer?.avatar}
            alt="Customer Avatar"
            width={120}
            className="mt-8"
          />

          <div className=" flex flex-col items-center justify-center mt-4">
            <label className="border-b-2">{customer?.name ?? "---"}</label>

            <label className="text-xs italic mt-4 border-b-2">
              {customer?.email ?? "---"}
            </label>
          </div>

          <Divider type="horizontal" dashed />

          {/* <DownloadSalesSummaryButton
            sale={sale}
            buttonText="Download Sale Summary"
          /> */}
        </div>
      </div>

      <div className="mt-2">
        <Divider />

        <Tooltip title="Go to Social Prices App">
          <a
            className="text-blue-500 hover:text-blue-600 cursor-pointer underline"
            onClick={() => router.push(Urls.ROOT)}
          >
            Social Prices
          </a>
        </Tooltip>
      </div>

      <footer>
        <Logo1 size={50} />
      </footer>
    </div>
  );
}
