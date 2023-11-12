import { useEffect, useState } from "react";

import { defaultAvatarImage } from "../../../shared/utils/images/files-names";
import { getImageAwsS3 } from "../../../shared/utils/images/url-images";

interface Props {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: any;
  onClick?: (event?: any) => void;
}

const Avatar: React.FC<Props> = ({
  src,
  alt,
  className,
  width = 60,
  onClick,
}) => {
  className = `object-cover rounded-full shadow-md ${className}`;

  const [image, setImage] = useState<string>(defaultAvatarImage);

  useEffect(() => {
    setImage(src ? getImageAwsS3(src) : defaultAvatarImage);
  }, [src]);

  return (
    <img
      src={image}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setImage(defaultAvatarImage)}
      style={{ width, height: width }}
    />
  );
};

export default Avatar;
