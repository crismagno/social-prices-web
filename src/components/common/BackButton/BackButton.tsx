import { Button } from "antd";
import { useRouter } from "next/navigation";

const BackButton: React.FC = () => {
  const router = useRouter();

  return (
    <Button className="z-50" onClick={() => router.back()}>
      Back
    </Button>
  );
};

export default BackButton;
