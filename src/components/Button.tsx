import React from "react";
import "../styles/Button.css";

type Variant =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";

type Size = "sm" | "md" | "lg";
type AlignX = "left" | "center" | "right"; // yatay
type AlignY = "start" | "center" | "end" | "bottom"; // dikey/bottom

export type ButtonProps = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  full?: boolean; // 100% genişlik
  alignX?: AlignX; // left/center/right -> margin auto ile
  alignY?: AlignY; // start/center/end/bottom -> align-self / margin-top:auto
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  full = false,
  alignX,
  alignY,
  loading = false,
  disabled = false,
  type = "button",
  className,
  onClick,
}) => {
  const base = "my-button-style";

  const alignXClass =
    alignX === "right"
      ? "push-right"
      : alignX === "left"
      ? "push-left"
      : alignX === "center"
      ? "center-inline"
      : "";

  const alignYClass =
    alignY === "bottom"
      ? "push-bottom"
      : alignY === "start"
      ? "self-start"
      : alignY === "end"
      ? "self-end"
      : alignY === "center"
      ? "self-center"
      : "";

  const classes = cx(
    base,
    variant, // .my-button-style.primary gibi
    `size-${size}`, // .size-sm/md/lg
    full && "full",
    alignXClass,
    alignYClass,
    (loading || disabled) && "is-disabled",
    loading && "is-loading",
    className
  );

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading || undefined}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
};

export default Button;
