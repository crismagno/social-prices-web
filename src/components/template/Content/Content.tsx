interface Props {
  children?: any;
}

const Content: React.FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};

export default Content;
