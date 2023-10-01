interface Props {
  src: string;
  alt?: string;
  className?: string;
  width?: any;
  height?: any;
}

const Avatar: React.FC<Props> = ({ src, alt, className, height, width }) => {
  className = `rounded-full shadow-md ${className}`;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
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
