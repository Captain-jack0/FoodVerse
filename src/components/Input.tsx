import React from "react";
import "../styles/Input.css";

interface InputProps {
  label: string;
  name: string;
  value?: string;
  placeholder?: string;
  type?: string;
  size?: "sm" | "md" | "lg";
  column?: 3 | 4 | 6 | 12;
  error?: string;
  touched?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  placeholder = "",
  type = "text",
  size = "md",
  column = 12,
  error,
  touched,
  onChange,
  onBlur,
}) => {
  const columnClass = `col-${column}`;
  const sizeClass = `input-${size}`;
  const showError = error && touched;

  return (
    <div className={`input-wrapper ${columnClass} ${sizeClass}`}>
      <label htmlFor={name} className="input-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`input-field ${showError ? "input-error" : ""}`}
      />
      {showError && <p className="input-error-text">{error}</p>}
    </div>
  );
};

export default Input;
