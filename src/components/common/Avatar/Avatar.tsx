import { useEffect, useState } from "react";

import { getAvatarImageLocalUrl } from "../../../shared/utils/images/url-images";

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

  const defaultImage: string = "/avatar-default.png";

  const [image, setImage] = useState<string>(defaultImage);

  useEffect(() => {
    setImage(src ? getAvatarImageLocalUrl(src) : defaultImage);
  }, [src]);

  return (
    <img
      src={image}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setImage(defaultImage)}
      style={{ width, height: width }}
    />
  );
};

export default Avatar;
