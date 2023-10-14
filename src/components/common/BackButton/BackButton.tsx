import { useRouter } from "next/navigation";

import Button from "../Button/Button";
import { IconArrowTurnLeft } from "../icons/icons";

const BackButton: React.FC = () => {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()} type="slate" className="px-3">
      {IconArrowTurnLeft("mr-1")}
      Back
    </Button>
  );
};

export default BackButton;
