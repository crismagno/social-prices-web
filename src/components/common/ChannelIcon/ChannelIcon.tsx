"use client";

import { ShopOutlined } from "@ant-design/icons";

import AppsEnum from "../../../shared/business/apps/apps.enum";
import InboxEnum from "../../../shared/business/inbox/inbox.enum";
import AppIcon from "../AppIcon/AppIcon";

interface Props {
  channel: InboxEnum.Channel;
  className?: string;
}

// The platform's own chat has no app behind it, so it gets a color of its own.
export const STORE_CHAT_COLOR: string = "#7c3aed";

// The icon of a channel of the inbox: its app's, or a shop for the store chat.
const ChannelIcon: React.FC<Props> = ({ channel, className }) => {
  const app: AppsEnum.App | undefined = InboxEnum.ChannelApp[channel];

  if (!app) {
    return (
      <ShopOutlined className={className} style={{ color: STORE_CHAT_COLOR }} />
    );
  }

  return <AppIcon app={app} className={className} />;
};

export default ChannelIcon;
