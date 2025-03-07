import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  marginTop?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "", style, marginTop }) => {
  const cardStyle: React.CSSProperties = {
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.05)", // Sombra sutil
    border: "1px solid rgba(0, 0, 0, 0.1)", // Borde tenue
    backgroundColor: "#ffffff", // Fondo blanco
    overflow: "hidden",
    marginTop,
    ...style,
  };

  return (
    <div className={`card ${className}`} style={cardStyle}>
      {children}
    </div>
  );
};

export default Card;