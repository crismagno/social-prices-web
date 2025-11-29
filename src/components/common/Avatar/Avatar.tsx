import { useEffect, useState } from "react";

import { Tooltip } from "antd";

import { getImageUrl } from "../../../shared/utils/images/images-url";
import ImagesEnum from "../../../shared/utils/images/images.enum";

interface Props {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: any;
  onClick?: (event?: any) => void;
  noUseAwsS3?: boolean;
  title?: string;
  defaultImage?: string;
}

const Avatar: React.FC<Props> = ({
  src,
  alt,
  className,
  width = 60,
  onClick,
  noUseAwsS3,
  title,
  defaultImage,
}) => {
  className = `object-cover rounded-full shadow-md ${className}`;

  const [image, setImage] = useState<string>();

  const defaultImageByParam: string =
    defaultImage ?? ImagesEnum.FilesNames.DefaultAvatarImage;

  useEffect(() => {
    let url: string = src ? getImageUrl(src) : defaultImageByParam;

    if (noUseAwsS3) {
      url = src ? src : defaultImageByParam;
    }

    setImage(url);
  }, [src, noUseAwsS3]);

  return (
    <Tooltip title={title}>
      <img
        src={image}
        alt={alt}
        className={className}
        onClick={onClick}
        onError={() => setImage(defaultImageByParam)}
        style={{ width, height: width }}
      />
    </Tooltip>
  );
};

export default Avatar;
