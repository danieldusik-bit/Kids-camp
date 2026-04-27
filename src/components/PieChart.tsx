"use client";

export type PieSegment = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  title: string;
  segments: PieSegment[];
  emptyText?: string;
};

const SIZE = 180;
const R = 80;
const CX = SIZE / 2;
const CY = SIZE / 2;

export default function PieChart({ title, segments, emptyText }: Props) {
  const total = segments.reduce((s, x) => s + x.value, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h4 className="text-sm font-semibold text-gray-800 mb-4">{title}</h4>

      {total === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          {emptyText || "Нет данных"}
        </p>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            width={SIZE}
            height={SIZE}
            className="flex-shrink-0"
          >
            {renderSlices(segments, total)}
          </svg>

          <ul className="flex-1 w-full flex flex-col gap-2 m-0 p-0 list-none">
            {segments
              .filter((s) => s.value > 0)
              .map((s) => {
                const pct = Math.round((s.value / total) * 100);
                return (
                  <li
                    key={s.label}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: s.color }}
                      />
                      <span className="text-gray-700 truncate">{s.label}</span>
                    </span>
                    <span className="text-gray-500 font-medium tabular-nums whitespace-nowrap">
                      {s.value} · {pct}%
                    </span>
                  </li>
                );
              })}
            <li className="flex items-center justify-between gap-3 text-xs text-gray-500 mt-1 pt-2 border-t border-gray-100">
              <span>Всего</span>
              <span className="tabular-nums">{total}</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

function renderSlices(segments: PieSegment[], total: number) {
  // Single-segment full-circle case (avoid degenerate arc).
  const filled = segments.filter((s) => s.value > 0);
  if (filled.length === 1) {
    return (
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill={filled[0].color}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  }

  let cursor = -Math.PI / 2; // start at top
  return filled.map((s, i) => {
    const angle = (s.value / total) * Math.PI * 2;
    const x1 = CX + R * Math.cos(cursor);
    const y1 = CY + R * Math.sin(cursor);
    const x2 = CX + R * Math.cos(cursor + angle);
    const y2 = CY + R * Math.sin(cursor + angle);
    const large = angle > Math.PI ? 1 : 0;
    const d = `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
    cursor += angle;
    return (
      <path
        key={i}
        d={d}
        fill={s.color}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  });
}
