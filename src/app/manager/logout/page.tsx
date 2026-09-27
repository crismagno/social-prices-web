"use client";

import { useEffect } from "react";

import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import useManagerAuthData from "../../../data/context/managerAuth/useManagerAuthData";

// Same reasoning as the user logout page: a dedicated route so the manager
// sidebar navigates here instead of calling logout() from the button's
// click event directly.
export default function ManagerLogoutPage() {
  const { logout } = useManagerAuthData();

  useEffect(() => {
    logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingFull />;
}
