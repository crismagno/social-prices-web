import { Image } from "antd";

import { defaultAvatarImage } from "../../../shared/utils/images/files-names";
import { getImageUrl } from "../../../shared/utils/images/url-images";

interface Props {
  defaultImage?: string;
  width?: number;
  className?: string;
  src?: string | null;
}

export const ImageOrDefault: React.FC<Props> = ({
  src,
  className = "rounded-full shadow-md",
  defaultImage = defaultAvatarImage,
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
