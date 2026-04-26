"use client";
type Opt = { value: string; label: string };
type Props = {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
};
export function Chips({ label, required, value, onChange, options }: Props) {
  return (
    <div className="flex flex-col gap-[7px]">
      {label && (
        <div className="text-[13px] font-semibold text-ink-soft">
          {label}
          {required && <span className="text-accent ml-1">*</span>}
        </div>
      )}
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {options.map((o) => {
          const on = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              className={[
                "h-10 px-4 rounded-full text-[14px] font-medium border transition-all",
                on
                  ? "bg-accent border-accent text-white shadow-[0_2px_8px_rgba(179,107,61,0.25)]"
                  : "bg-surface-soft border-line text-ink-soft hover:border-accent hover:text-accent-strong",
              ].join(" ")}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
