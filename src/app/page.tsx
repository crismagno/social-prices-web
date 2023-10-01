"use client";

import LoadingFull from "../components/common/LoadingFull/LoadingFull";
import useForceRedirect from "../hooks/useForceRedirect/useForceRedirect";

export default function Home() {
  useForceRedirect();

  return <LoadingFull />;
}
