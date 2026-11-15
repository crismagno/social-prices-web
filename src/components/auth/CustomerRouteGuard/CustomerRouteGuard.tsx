"use client";

import { ReactNode, useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

import useAuthData from "../../../data/context/auth/useAuthData";
import Urls from "../../../shared/common/routes-app/routes-app";

// What a customer account may open: its own area plus the account pages. The
// API refuses everything else anyway; this only keeps them off empty screens.
export const CUSTOMER_ALLOWED_PREFIXES: string[] = [
  "/customer",
  Urls.SUPPORT,
  Urls.SETTINGS,
  Urls.PROFILE,
  Urls.NOTIFICATIONS,
  Urls.UPDATE_EMAIL,
  Urls.LOGOUT,
];

export const isPathAllowedForCustomer = (pathname: string): boolean =>
  CUSTOMER_ALLOWED_PREFIXES.some(
    (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

const isCustomerArea = (pathname: string): boolean =>
  pathname === "/customer" || pathname.startsWith("/customer/");

// Keeps each kind of account on its own pages: customers out of the store
// screens, companies out of the customer area.
export default function CustomerRouteGuard({
  children,
}: {
  children: ReactNode;
}) {
  const { isCustomer } = useAuthData();

  const router = useRouter();

  const pathname: string = usePathname() ?? "";


  const mustLeave: boolean = isCustomer
    ? !isPathAllowedForCustomer(pathname)
    : isCustomerArea(pathname);

  useEffect(() => {
    if (mustLeave) {
      router.replace(isCustomer ? Urls.CUSTOMER_DASHBOARD : Urls.DASHBOARD);
    }
  }, [mustLeave, isCustomer, router]);

  return mustLeave ? null : <>{children}</>;
}
