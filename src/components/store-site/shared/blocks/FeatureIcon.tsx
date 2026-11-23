import {
  BulbOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  GiftOutlined,
  GlobalOutlined,
  HeartOutlined,
  LockOutlined,
  RocketOutlined,
  SafetyOutlined,
  SmileOutlined,
  StarOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  TruckOutlined,
} from "@ant-design/icons";

import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";

const ICONS: Record<StoreSitesEnum.FeatureIcon, typeof StarOutlined> = {
  [StoreSitesEnum.FeatureIcon.STAR]: StarOutlined,
  [StoreSitesEnum.FeatureIcon.HEART]: HeartOutlined,
  [StoreSitesEnum.FeatureIcon.ROCKET]: RocketOutlined,
  [StoreSitesEnum.FeatureIcon.SHIELD]: SafetyOutlined,
  [StoreSitesEnum.FeatureIcon.BOLT]: ThunderboltOutlined,
  [StoreSitesEnum.FeatureIcon.CHECK]: CheckCircleOutlined,
  [StoreSitesEnum.FeatureIcon.CLOCK]: ClockCircleOutlined,
  [StoreSitesEnum.FeatureIcon.GIFT]: GiftOutlined,
  [StoreSitesEnum.FeatureIcon.TRUCK]: TruckOutlined,
  [StoreSitesEnum.FeatureIcon.SMILE]: SmileOutlined,
  [StoreSitesEnum.FeatureIcon.TROPHY]: TrophyOutlined,
  [StoreSitesEnum.FeatureIcon.BULB]: BulbOutlined,
  [StoreSitesEnum.FeatureIcon.TEAM]: TeamOutlined,
  [StoreSitesEnum.FeatureIcon.GLOBAL]: GlobalOutlined,
  [StoreSitesEnum.FeatureIcon.LOCK]: LockOutlined,
  [StoreSitesEnum.FeatureIcon.CUSTOMER_SERVICE]: CustomerServiceOutlined,
};

/** The ready icon of a feature card; an unknown one shows the star. */
const FeatureIcon = ({ icon }: { icon: StoreSitesEnum.FeatureIcon | null }) => {
  const Icon = (icon && ICONS[icon]) || StarOutlined;

  return <Icon />;
};

export default FeatureIcon;
