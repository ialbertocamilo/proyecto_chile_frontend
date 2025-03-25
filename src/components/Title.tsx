import React from "react";

interface TitleProps {
  text: string;
}

const Title: React.FC<TitleProps> = ({ text }) => {
  return (
    <div className="col-sm-6 p-0 mt-0">
      <h4 className="title font-weight-bold">{text}</h4>
    </div>
  );
};

export default Title;
