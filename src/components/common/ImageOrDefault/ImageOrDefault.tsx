import { Image } from "antd";

import { getImageUrl } from "../../../shared/utils/images/images-url";
import ImagesEnum from "../../../shared/utils/images/images.enum";

interface Props {
  defaultImage?: string;
  width?: number;
  className?: string;
  src?: string | null;
}

export const ImageOrDefault: React.FC<Props> = ({
  src,
  className = "rounded-full shadow-md",
  defaultImage = ImagesEnum.FilesNames.DefaultAvatarImage,
  width = 40,
}) => {
  return (
    <Image
      width={width}
      height={width}
      src={src ? getImageUrl(src) : defaultImage}
      onError={() => (
        <Image
          width={width}
          height={width}
          src={defaultImage}
          alt="image default"
          className={className}
        />
      )}
      alt="image default"
      className={className}
    />
  );
};
