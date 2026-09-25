"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

const LOGIN_SIDE_IMAGES: string[] = [
  "/assets/images/login-side-1.svg",
  "/assets/images/login-side-2.svg",
  "/assets/images/login-side-3.svg",
  "/assets/images/login-side-4.svg",
];

export const LoginSideImage: React.FC = () => {
  // Picked after mount: a random value during render would differ between the
  // server and the client and break hydration.
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    setSrc(
      LOGIN_SIDE_IMAGES[Math.floor(Math.random() * LOGIN_SIDE_IMAGES.length)],
    );
  }, []);

  return (
    <div className="hidden md:block md:w-2-1/2 lg:w-2/3 bg-emerald-50">
      {src && (
        <Image
          src={src}
          alt="Images on side"
          width={1000}
          height={1000}
          className="h-screen w-full object-cover"
        />
      )}
    </div>
  );
};
