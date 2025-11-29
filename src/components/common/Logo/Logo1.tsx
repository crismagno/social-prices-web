import Image from "next/image";

import ImagesEnum from "../../../shared/utils/images/images.enum";

interface Props {
  size?: number;
  className?: string;
}
export const Logo1: React.FC<Props> = ({ size = 150, className }) => {
  return (
    <Image
      src={ImagesEnum.FilesNames.DefaultLogo1Image}
      alt="logo"
      width={size}
      height={size}
      className={className ?? "m-5"}
    />
  );
};
