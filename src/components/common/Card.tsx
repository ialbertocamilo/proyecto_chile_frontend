// Card.tsx
import React from "react";

interface CardProps {
  children: React.ReactNode;
  width?: string;
  borderRadius?: string;
  marginTop?: string;
  marginRight?: string;
  marginLeft?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  children,
  width = "100%",
  borderRadius = "16px",
  marginTop = "120px",
  marginRight = "0px",
  marginLeft = "0px",
  style,
}) => {
  const cardStyle: React.CSSProperties = {
    width,
    borderRadius,
    marginTop,
    marginRight,
    marginLeft,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #ccc",
    ...style, // Permite sobrescribir o agregar estilos adicionales
  };

  return (
    <div className="card" style={cardStyle}>
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;
