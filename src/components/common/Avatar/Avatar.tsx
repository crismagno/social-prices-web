interface Props {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: any;
  height?: any;
  onClick?: (event?: any) => void;
}

const Avatar: React.FC<Props> = ({
  src,
  alt,
  className,
  height,
  width,
  onClick,
}) => {
  className = `rounded-full shadow-md ${className}`;

  return (
    <img
      src={src ?? "/avatar-default.png"}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => (
        <img
          src={"/avatar-default.png"}
          alt={alt}
          className={className}
          width={width ?? "50%"}
          height={height ?? "50%"}
        />
      )}
      width={width ?? "50%"}
      height={height ?? "50%"}
    />
  );
};

export default Avatar;
