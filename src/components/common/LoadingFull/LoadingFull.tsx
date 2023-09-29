import Image from "next/image";

interface Props {}

const LoadingFull: React.FC<Props> = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <Image src={"/loading.gif"} alt="loading" width={50} height={50} />
    </div>
  );
};

export default LoadingFull;
