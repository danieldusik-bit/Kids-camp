"use client";
type Props = {
  id: string;
  label?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  rows?: number;
  placeholder?: string;
};
export function Area({
  id,
  label,
  required,
  value,
  onChange,
  onBlur,
  error,
  rows = 3,
  placeholder,
}: Props) {
  return (
    <div className="flex flex-col gap-[7px]">
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-soft">
          {label}
          {required && (
            <span className="text-accent ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={[
          "bg-surface-soft border rounded-xl px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-mute resize-y min-h-[88px] outline-none transition-all",
          error
            ? "border-err"
            : "border-line focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent-soft",
        ].join(" ")}
      />
      {error && <div className="text-xs text-err">{error}</div>}
    </div>
  );
}
