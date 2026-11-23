import {
  CommentOutlined,
  CustomerServiceOutlined,
  HeartOutlined,
  MailOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  ShopOutlined,
  SmileOutlined,
} from "@ant-design/icons";

import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";

const ICONS: Record<StoreSitesEnum.ChatIcon, typeof MessageOutlined> = {
  [StoreSitesEnum.ChatIcon.MESSAGE]: MessageOutlined,
  [StoreSitesEnum.ChatIcon.COMMENT]: CommentOutlined,
  [StoreSitesEnum.ChatIcon.CUSTOMER_SERVICE]: CustomerServiceOutlined,
  [StoreSitesEnum.ChatIcon.QUESTION]: QuestionCircleOutlined,
  [StoreSitesEnum.ChatIcon.SMILE]: SmileOutlined,
  [StoreSitesEnum.ChatIcon.HEART]: HeartOutlined,
  [StoreSitesEnum.ChatIcon.SHOP]: ShopOutlined,
  [StoreSitesEnum.ChatIcon.MAIL]: MailOutlined,
};

interface Props {
  icon: StoreSitesEnum.ChatIcon;
}

/** The ready icon of the chat button; an unknown one shows the message. */
const SiteChatIcon = ({ icon }: Props) => {
  const Icon = ICONS[icon] ?? MessageOutlined;

  return <Icon />;
};

export default SiteChatIcon;
