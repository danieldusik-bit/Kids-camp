"use client";
import { ReactNode } from "react";
type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  error?: boolean;
};
export function CheckRow({ checked, onChange, children, error }: Props) {
  return (
    <label
      className={[
        "flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
        checked
          ? "bg-accent-soft/50 border-accent"
          : "bg-surface-soft border-line hover:border-line-strong",
        error && !checked ? "border-err" : "",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-[18px] h-[18px] accent-[rgb(var(--accent))] flex-shrink-0"
      />
      <span className="text-[14px] leading-[1.45] text-ink-soft">
        {children}
      </span>
    </label>
  );
}
