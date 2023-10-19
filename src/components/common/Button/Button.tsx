import { ButtonHTMLAttributes } from "react";

import Loading, { LoadingProps } from "../Loading/Loading";

type TButtonColor =
  | "default"
  | "danger"
  | "warning"
  | "primary"
  | "success"
  | "slate"
  | "transparent";

const ButtonColor = {
  default:
    "bg-gradient-to-tr from-gray-400 to-gray-600 hover:to-gray-800 text-white",
  danger:
    "bg-gradient-to-tr from-red-400 to-red-600 text-white hover:to-red-800",
  warning:
    "bg-gradient-to-tr from-yellow-400 to-yellow-600 hover:to-yellow-800",
  primary:
    "bg-gradient-to-tr from-blue-400 to-blue-600 text-white hover:to-blue-800",
  success:
    "bg-gradient-to-tr from-green-400 to-green-600 text-white hover:to-green-800",
  slate:
    "bg-gradient-to-tr from-slate-400 to-slate-600 text-white hover:to-slate-800",
  transparent: "transparent hover:bg-gray-200",
};

interface ButtonLoadingProps extends LoadingProps {
  isLoading: boolean;
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: TButtonColor;
  loading?: ButtonLoadingProps;
}

const Button: React.FC<Props> = ({
  onClick,
  children,
  className,
  color,
  loading,
  ...props
}) => {
  color = color ?? "default";

  return (
    <button
      onClick={onClick}
      className={`flex shadow-md rounded-md p-2 ${ButtonColor[color]} ${className}`}
      {...props}
    >
      {loading?.isLoading ? <Loading {...loading} /> : children}
    </button>
  );
};

export default Button;
