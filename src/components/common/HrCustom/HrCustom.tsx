interface Props {
  className?: string;
}

const HrCustom: React.FC<Props> = ({ className }) => {
  return (
    <div
      className={`border-t border-slate-100 w-full my-10 ${className}`}
    ></div>
  );
};

export default HrCustom;
