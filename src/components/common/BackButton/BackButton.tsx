import { Button } from 'antd';
import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

export const BackButton: React.FC = () => {
  const router: AppRouterInstance = useRouter();

  return (
    <Button className="z-50" onClick={() => router.back()}>
      Back
    </Button>
  );
};
