import React from "react";

interface TitleProps {
  text: string;
}

const Title: React.FC<TitleProps> = ({ text }) => {
  return (
    <div className="col-sm-6 p-0">
      <h4 className="title font-bold">{text}</h4>
      <hr className="line-title" />
    </div>
  );
};

export default Title;
