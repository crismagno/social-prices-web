"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import Urls from "../shared/common/routes-app/routes-app";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push(Urls.LOGIN);
  }, []);

  return (
    <div className="w-full h-full flex justify-center items-center">
      Loading
    </div>
  );
}
