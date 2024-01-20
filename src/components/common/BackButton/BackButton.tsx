import { useRouter } from "next/navigation";

import Button from "../ButtonCommon/ButtonCommon";
import { IconArrowTurnLeft } from "../icons/icons";

const BackButton: React.FC = () => {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()} color="slate" className="px-3">
      {IconArrowTurnLeft("mr-1")}
      Back
    </Button>
  );
};

export default BackButton;
