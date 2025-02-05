import React from 'react';

interface CardProps {
  title: string;
  content: string;
  footer?: string;
}

const Card: React.FC<CardProps> = ({ title, content, footer }) => {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{content}</p>
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
