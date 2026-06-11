"use client";
import type { ReactNode } from "react";

/**
 * Small inline alert used inside the public form steps.
 * - tone="warn"  → amber, for "attention / spots are full" messages
 * - tone="info"  → soft blue, for neutral guidance (e.g. fill in Latvian)
 */
export function Notice({
  tone = "info",
  icon,
  children,
}: {
  tone?: "info" | "warn";
  icon?: ReactNode;
  children: ReactNode;
}) {
  const styles =
    tone === "warn"
      ? "bg-[#fdf4e6] border-[#ecc488] text-[#7c4d0f]"
      : "bg-[#eef4fb] border-[#bcd5f0] text-[#1f4f86]";
  return (
    <div
      role="note"
      className={[
        "rounded-2xl border-[1.5px] p-4 flex gap-3 items-start text-[13.5px] leading-snug animate-slideIn",
        styles,
      ].join(" ")}
    >
      {icon && (
        <span className="text-[18px] leading-none mt-px flex-shrink-0">
          {icon}
        </span>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
