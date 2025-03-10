import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  marginTop?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "", style,  }) => {
  const cardStyle: React.CSSProperties = {
    borderRadius: '0rem',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div className={`card news-update rounded-2 ${className}`} style={cardStyle}>
      <div className="card-body rounded-4">
        {children}
      </div>
    </div>
  );
};

export default Card;
