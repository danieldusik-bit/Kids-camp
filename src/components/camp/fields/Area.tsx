"use client";
type Props = {
  id: string;
  label?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
};
export function Area({ id, label, value, onChange, rows = 3, placeholder }: Props) {
  return (
    <div className="flex flex-col gap-[7px]">
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-soft">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface-soft border border-line rounded-xl px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-mute resize-y min-h-[88px] outline-none focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent-soft transition-all"
      />
    </div>
  );
}
