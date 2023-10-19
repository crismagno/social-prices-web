import Image from "next/image";

export interface LoadingProps {
  width?: number;
  height?: number;
  element?: any;
}

const Loading: React.FC<LoadingProps> = ({ height, width, element }) => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      {element}
      <Image
        src={"/loading.gif"}
        alt="loading"
        width={width ?? 50}
        height={height ?? 50}
      />
    </div>
  );
};

export default Loading;
