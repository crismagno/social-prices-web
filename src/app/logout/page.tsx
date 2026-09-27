"use client";

import { useEffect } from "react";

import LoadingFull from "../../components/common/LoadingFull/LoadingFull";
import useAuthData from "../../data/context/auth/useAuthData";

// A dedicated route, not a click handler: the sidebar navigates here instead
// of calling logout() directly from the button's event, so a stray double
// click or a re-render near the button can never fire it by accident.
export default function LogoutPage() {
  const { logout } = useAuthData();

  useEffect(() => {
    logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingFull />;
}
