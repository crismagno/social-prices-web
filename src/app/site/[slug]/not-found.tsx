"use client";

import useSiteT from "../../../components/store-site/shared/useSiteT";

export default function SiteNotFound() {
  const t = useSiteT();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        textAlign: "center",
        background: "#faf6ee",
        color: "#4b5545",
      }}
    >
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>
          {t("storeSite.public.notFoundTitle")}
        </h1>
        <p style={{ opacity: 0.8 }}>{t("storeSite.public.notFoundText")}</p>
      </div>
    </main>
  );
}
