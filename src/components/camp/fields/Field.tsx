"use client";
import { ReactNode } from "react";

type Props = {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?:
    | "text"
    | "email"
    | "tel"
    | "numeric"
    | "decimal"
    | "search"
    | "url";
  hint?: string;
  prefix?: ReactNode;
};

export function Field({
  id,
  label,
  required,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  autoComplete,
  inputMode,
  hint,
  prefix,
}: Props) {
  return (
    <div className="flex flex-col gap-[7px]">
      <label htmlFor={id} className="text-[13px] font-semibold text-ink-soft">
        {label}
        {required && (
          <span className="text-accent ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div
        className={[
          "flex items-stretch bg-surface-soft border rounded-xl transition-all overflow-hidden",
          error
            ? "border-err"
            : "border-line focus-within:border-accent focus-within:bg-surface focus-within:ring-4 focus-within:ring-accent-soft",
        ].join(" ")}
      >
        {prefix && (
          <span className="flex items-center px-3 text-ink-mute text-sm bg-line/40 font-medium">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="flex-1 bg-transparent border-0 outline-none px-3.5 h-[46px] text-[15px] text-ink placeholder:text-ink-mute"
        />
      </div>
      {hint && !error && <div className="text-xs text-ink-mute">{hint}</div>}
      {error && <div className="text-xs text-err">{error}</div>}
    </div>
  );
}
