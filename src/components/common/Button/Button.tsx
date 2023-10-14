type TButtonType =
  | "default"
  | "danger"
  | "warning"
  | "primary"
  | "success"
  | "slate";

const ButtonTypes = {
  default: "bg-gradient-to-tr from-gray-400 to-gray-600 hover:to-gray-800",
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
};

interface Props {
  onClick?: (event: any) => void;
  children?: any;
  type?: TButtonType;
  className?: string;
}

const Button: React.FC<Props> = ({
  onClick,
  children,
  className,
  type,
  ...props
}) => {
  type = type ?? "default";

  return (
    <button
      onClick={onClick}
      className={`flex shadow-md rounded-lg p-2 ${ButtonTypes[type]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
