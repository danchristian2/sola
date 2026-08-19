import type { ReactNode } from "react";

export function Button({
  children,
  type = "button",
  variant = "primary",
  disabled,
  onClick,
  form,
  className = ""
}: {
  children: ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick?: () => void;
  form?: string;
  className?: string;
}) {
  return (
    <button
      type={type}
      form={form}
      disabled={disabled}
      onClick={onClick}
      className={`${variant === "primary" ? "btn-primary" : "btn-secondary"} ${className}`}
    >
      {children}
    </button>
  );
}

export function TextField({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  autoComplete
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="input"
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
      />
    </label>
  );
}

export function EmptyState({ title }: { title: string }) {
  return (
    <div className="px-5 py-8 text-center text-sm text-muted-foreground">{title}</div>
  );
}
