import React from "react";

import { Button, Tooltip } from "antd";

import { ArrowRightOutlined } from "@ant-design/icons";

import { ImageOrDefault } from "../ImageOrDefault/ImageOrDefault";

interface Props {
  src?: string | null;
  title?: string;
  subtitle?: string;
  onClickButton?: (event: any) => void | Promise<void>;
  onClickTitleButton?: (event: any) => void | Promise<void>;
  buttonIcon?: any;
  buttonTooltip?: string;
  className?: string;
  styleLeft?: any;
  defaultImage?: string;
}

export const AvatarDescription: React.FC<Props> = ({
  src,
  buttonIcon,
  onClickButton,
  onClickTitleButton,
  subtitle,
  title,
  buttonTooltip,
  className,
  styleLeft,
  defaultImage,
}) => {
  return (
    <div
      className={`flex items-end justify-between border p-2 rounded-lg ${className}`}
    >
      <div
        className="flex flex-row items-center"
        style={styleLeft ?? { width: 282 }}
      >
        <div className="mr-5 flex items-center">
          <ImageOrDefault src={src} defaultImage={defaultImage} />
        </div>

        <div className="flex flex-col">
          <label
            className="text-base cursor-pointer hover:text-blue-500"
            onClick={onClickTitleButton}
          >
            {title}
          </label>
          <label className="color-gray-1 text-sm">{subtitle}</label>
        </div>
      </div>

      <div>
        {onClickButton && (
          <Tooltip title={buttonTooltip}>
            <Button
              className="ml-3"
              type="primary"
              size="small"
              onClick={onClickButton}
              icon={buttonIcon ?? <ArrowRightOutlined />}
            />
          </Tooltip>
        )}
      </div>
    </div>
  );
};
