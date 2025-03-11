import React, { useMemo } from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  marginTop?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "", style }) => {
  const cardStyle: React.CSSProperties = {
    border: 'none',
    overflow: 'hidden',
    boxShadow: '0 0 40px rgba(8, 21, 66, 0.05)',
    borderRadius: '12px !important',
    transition: 'all 0.3s ease',
    ...style,
  };
  console.log('.')

  return <div className="col-xxl-12 col-xl-12 box-col-12 order-xl-1 col-sm-12 col-md-12">
    <div className={`card news-update  rounded-2 ${className}`} style={cardStyle}>
      <div className={"card-body "}>
        {children}
      </div>
    </div>
  </div>

};

export default Card;
