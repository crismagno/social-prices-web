import React from "react";

interface Props {
  children?: any;
  onFileSelectError: (message: string) => void;
  onFileSelectSuccess: (file: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

const UploadFile: React.FC<Props> = ({
  onFileSelectSuccess,
  onFileSelectError,
  className = "",
  style,
}) => {
  const handleFileInput = (e: any) => {
    const file = e.target.files[0];
    if (file.size > 1024) {
      onFileSelectError("File size cannot exceed more than 1MB");
    } else {
      onFileSelectSuccess(file);
    }
  };

  return (
    <div className={className} style={style}>
      <input type="file" onChange={handleFileInput} />
    </div>
  );
};

export default UploadFile;
