import { forwardRef, useImperativeHandle, useState } from "react";

export enum WormAlertTypeEnum {
  WARNING = "WARNING",
  DANGER = "DANGER",
  SUCCESS = "SUCCESS",
  INFO = "INFO",
  DEFAULT = "DEFAULT",
}

export const WormAlertTypeClassName = {
  [WormAlertTypeEnum.WARNING]: "bg-yellow-400 text-white",
  [WormAlertTypeEnum.DANGER]: "bg-red-400 text-white",
  [WormAlertTypeEnum.SUCCESS]: "bg-green-400 text-white",
  [WormAlertTypeEnum.INFO]: "bg-blue-400 text-white",
  [WormAlertTypeEnum.DEFAULT]: "bg-gray-400 text-white",
};

export interface IWormAlertRefProps {
  showWormText: (
    text: string,
    seconds?: number,
    typeAlert?: WormAlertTypeEnum
  ) => void;
}

interface Props {
  className?: string;
  icon?: any;
}

const WormAlert = forwardRef<IWormAlertRefProps, Props>(
  ({ className, icon }, ref) => {
    const [text, setText] = useState<string | null>(null);

    const [type, setType] = useState<WormAlertTypeEnum>(
      WormAlertTypeEnum.DEFAULT
    );

    const showWormText = (
      text: string,
      seconds?: number = 1,
      typeAlert: WormAlertTypeEnum
    ): void => {
      if (!text) {
        return;
      }

      if (typeAlert) {
        setType(typeAlert);
      }

      setText(text);

      setTimeout(() => {
        setText(null);
        setType(WormAlertTypeEnum.DEFAULT);
      }, seconds * 1000);
    };

    useImperativeHandle(ref, () => ({
      showWormText,
    }));

    return text ? (
      <div
        className={`flex flex-row rounded-lg ${WormAlertTypeClassName[type]} px-4 py-3 ${className}`}
      >
        {icon}
        {text}
      </div>
    ) : (
      <></>
    );
  }
);

export default WormAlert;
