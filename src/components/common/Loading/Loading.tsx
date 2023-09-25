import Image from "next/image";

interface Props {}

const Loading: React.FC<Props> = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <Image src={"/loading.gif"} alt="loading" width={50} height={50} />
    </div>
  );
};

export default Loading;
