import React, { useState } from "react";
import "../styles/Button.css";

type ButtonProps = {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "error"
    | "neutral";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  column?: number; // grid sistemi desteği
  responsive?: string; // örn: "col-md-6 col-lg-4"
  padding?: "p-sm" | "p-md" | "p-lg";
  border?: "border" | "border-rounded" | "border-none";
  collapsible?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  column,
  responsive = "",
  padding = "p-md",
  border = "border-rounded",
  collapsible = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const baseClass = "my-button";
  const classes = [
    baseClass,
    `${baseClass}--${variant}`,
    `${baseClass}--${size}`,
    fullWidth ? `${baseClass}--fullwidth` : "",
    loading || disabled ? `${baseClass}--disabled` : "",
    column ? `col-${column}` : "",
    responsive,
    padding,
    border,
    collapsible ? "collapsible" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (collapsible && !isOpen) {
    return (
      <button
        className={`${baseClass}__toggle ${responsive}`}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        ▼ Göster
      </button>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {collapsible && (
        <span className="collapse-btn" onClick={() => setIsOpen(false)}>
          ✖
        </span>
      )}
      {loading ? <span className="spinner">⏳</span> : children}
    </button>
  );
};

export default Button;
