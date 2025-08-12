import React from "react";
import "../styles/Select.css";

export type SelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

type LabelLink = { text: string; href: string; download?: boolean };

type SelectProps = {
  id: string;
  name?: string;
  label?: string;
  labelLink?: LabelLink;
  options: SelectOption[];
  placeholder?: string;

  /* Formik/RHF uyumlu props */
  value?: string | number;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  onBlur?: React.FocusEventHandler<HTMLSelectElement>;

  error?: string;
  helperText?: string;

  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;

  className?: string;
  column?: number; // grid helper: 3,4,6,12...
  responsive?: string; // "col-md-6 col-lg-4" gibi extra sınıflar
};

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

const Select: React.FC<SelectProps> = ({
  id,
  name,
  label,
  options,
  placeholder = "Select…",
  value,
  onChange,
  onBlur,
  error,
  size = "md",
  disabled,
  className,
  column,
}) => {
  return (
    <div
      className={cx(
        "select-wrapper",
        `col-${column}`,
        size && `select-${size}`,
        error && "select-error",
        disabled && "is-disabled",
        className
      )}
    >
      {label && (
        <label htmlFor={id} className="select-label">
          <span>{label}</span>
        </label>
      )}

      <div className="select-control">
        <select
          id={id}
          name={name}
          className="select-field"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="select-chevron">▾</span>
      </div>

      {error && <div className="select-error-text">{error}</div>}
    </div>
  );
};

export default Select;
