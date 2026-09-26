"use client";

import useLanguageData from "../../../data/context/language/useLanguageData";

interface Props {
  value?: string | null;
  className?: string;
}

// Only real http(s) links are clickable, so a stored value can never turn into a
// javascript: link.
const isHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);

export const TrackingNumberLine: React.FC<Props> = ({
  value,
  className = "text-center",
}) => {
  const { t } = useLanguageData();

  const trackingNumber: string = value?.trim() ?? "";

  if (!trackingNumber) {
    return null;
  }

  return (
    <div className={className}>
      <b>{t("sales.trackingNumber")}: </b>

      {isHttpUrl(trackingNumber) ? (
        <a
          href={trackingNumber}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 break-all"
        >
          {trackingNumber}
        </a>
      ) : (
        <span className="break-all">{trackingNumber}</span>
      )}
    </div>
  );
};
