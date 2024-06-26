import { useEffect, useState } from "react";

import { Tooltip } from "antd";

import { defaultAvatarImage } from "../../../shared/utils/images/files-names";
import { getImageUrl } from "../../../shared/utils/images/url-images";

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

  const defaultImageByParam: string = defaultImage ?? defaultAvatarImage;

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
