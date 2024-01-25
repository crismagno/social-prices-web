import { useEffect, useState } from "react";

import { Tooltip } from "antd";

import { defaultAvatarImage } from "../../../shared/utils/images/files-names";
import { getImageAwsS3 } from "../../../shared/utils/images/url-images";

interface Props {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: any;
  onClick?: (event?: any) => void;
  noUseAwsS3?: boolean;
  title?: string;
}

const Avatar: React.FC<Props> = ({
  src,
  alt,
  className,
  width = 60,
  onClick,
  noUseAwsS3,
  title,
}) => {
  className = `object-cover rounded-full shadow-md ${className}`;

  const [image, setImage] = useState<string>();

  useEffect(() => {
    let url: string = src ? getImageAwsS3(src) : defaultAvatarImage;

    if (noUseAwsS3) {
      url = src ? src : defaultAvatarImage;
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
        onError={() => setImage(defaultAvatarImage)}
        style={{ width, height: width }}
      />
    </Tooltip>
  );
};

export default Avatar;
