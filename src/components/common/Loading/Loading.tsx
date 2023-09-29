import Image from "next/image";

interface Props {
  width?: number;
  height?: number;
}

const Loading: React.FC<Props> = ({ height, width }) => {
  return (
    <div className="flex justify-center items-center h-full w-full">
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
