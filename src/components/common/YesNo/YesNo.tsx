interface Props {
  isTrue: boolean;
}

const YesNo: React.FC<Props> = ({ isTrue }) => {
  return <>{isTrue ? "Yes" : "No"}</>;
};

export default YesNo;
