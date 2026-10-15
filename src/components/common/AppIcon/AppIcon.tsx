"use client";

import { ReactNode, useId } from "react";

import AppsEnum from "../../../shared/business/apps/apps.enum";
import GoogleColorIcon from "../GoogleColorIcon/GoogleColorIcon";

interface Props {
  app: AppsEnum.App;
  className?: string;
}

// Brand-colored icons for the apps catalog, drawn as inline SVG (antd's icons
// are single-color). Sized in em so they follow the surrounding font size.
const Svg: React.FC<{ className?: string; children: ReactNode }> = ({
  className,
  children,
}) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    width="1em"
    height="1em"
    aria-hidden="true"
    style={{ verticalAlign: "-0.125em" }}
  >
    {children}
  </svg>
);

const AppIcon: React.FC<Props> = ({ app, className }) => {
  const gradientId: string = useId();

  switch (app) {
    case AppsEnum.App.GOOGLE_CONTACTS:
      return <GoogleColorIcon className={className} />;

    case AppsEnum.App.FACEBOOK:
      return (
        <Svg className={className}>
          <circle cx="24" cy="24" r="22" fill="#1877F2"/><path fill="#fff" d="M26.6 38V26.4h3.9l.6-4.5h-4.5v-2.900c0-1.3.4-2.2 2.3-2.200h2.400v-4c-.4-.1-1.8-.2-3.5-.2-3.5 0-5.8 2.1-5.8 5.900v3.400h-3.900v4.500h3.900V38z"/>
        </Svg>
      );

    case AppsEnum.App.INSTAGRAM:
      return (
        <Svg className={className}>
          <defs><linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#FEDA75"/><stop offset="0.25" stopColor="#FA7E1E"/><stop offset="0.5" stopColor="#D62976"/><stop offset="0.75" stopColor="#962FBF"/><stop offset="1" stopColor="#4F5BD5"/></linearGradient></defs><rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${gradientId})`}/><rect x="12" y="12" width="24" height="24" rx="7" fill="none" stroke="#fff" strokeWidth="3"/><circle cx="24" cy="24" r="5.5" fill="none" stroke="#fff" strokeWidth="3"/><circle cx="31.5" cy="16.5" r="1.8" fill="#fff"/>
        </Svg>
      );

    case AppsEnum.App.WHATSAPP:
      return (
        <Svg className={className}>
          <circle cx="24" cy="24" r="22" fill="#25D366"/><path fill="#fff" d="M24 11.500c-6.9 0-12.5 5.6-12.5 12.5 0 2.3.6 4.4 1.7 6.300L11.5 36.500l6.4-1.700c1.8 1 3.9 1.5 6.1 1.5 6.9 0 12.5-5.6 12.5-12.500S30.9 11.5 24 11.500z"/><path fill="#25D366" d="M19.6 17.600c-.4 0-1 .1-1.5.7-.5.6-1.3 1.5-1.3 3.2 0 1.7 1.2 3.3 1.4 3.6.2.2 2.4 3.9 6 5.3 3 1.2 3.6.9 4.2.9.6-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.7-.4l-2.3-1.100c-.3-.1-.6-.2-.9.200l-1 1.200c-.2.3-.4.3-.8.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8l.6-.7c.2-.2.2-.4.4-.7.1-.3.1-.5 0-.7l-1-2.400c-.3-.6-.6-.6-.8-.6z"/>
        </Svg>
      );

    case AppsEnum.App.TELEGRAM:
      return (
        <Svg className={className}>
          <circle cx="24" cy="24" r="22" fill="#229ED9"/><path fill="#fff" d="M35.5 13.5 11.5 22.800l7.3 2.6 4.7 9.1 3.5-5.3 6.5 4.800z"/><path fill="#C8DAEA" d="M18.8 25.4 35.5 13.5 22 27.500l1.5 7z"/>
        </Svg>
      );

    default:
      return null;
  }
};

export default AppIcon;
