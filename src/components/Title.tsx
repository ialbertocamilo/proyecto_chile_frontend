import React from "react";

interface TitleProps {
  text: string;
}

const Title: React.FC<TitleProps> = ({ text }) => {
  return (
    <div className="col-sm-6 ps-0 col-sm-6 ps-0 mx-auto mx-md-0 ms-md-3">
      <h1 className="title">{text}</h1>
      <style jsx>{`
        .title {
          font-size:1.8rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 1rem;
          
          margin-top: 10rem
        }
      `}</style>
    </div>
  );
};

export default Title;
