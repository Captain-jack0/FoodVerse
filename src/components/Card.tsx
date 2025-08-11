import React from "react";
import "../styles/Card.css";

type CardProps = {
  title?: string;
  children: React.ReactNode;
  column?: number; // Ekledik: kaç sütunluk yer kaplayacak (1–12)
  className?: string;
};

const Card: React.FC<CardProps> = ({
  title,
  children,
  column = 12,
  className,
}) => {
  const columnClass = `col-${column}`;

  return (
    <div className={`custom-card ${columnClass} ${className || ""}`}>
      {title && <div className="custom-card-title">{title}</div>}
      <div className="custom-card-body">{children}</div>
    </div>
  );
};

export default Card;
