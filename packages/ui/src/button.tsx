import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, type = "button", ...props }: ButtonProps) {
  return (
    <button className="envbox-button" type={type} {...props}>
      {children}
    </button>
  );
}