"use client";

import React from "react";

/* ─── Hero ─────────────────────────────────────────── */

export function Hero({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="vd-hero">
      <div>
        <h1 className="vd-hero-title">{title}</h1>
        {subtitle && <p className="vd-hero-sub">{subtitle}</p>}
      </div>
      {action}
    </section>
  );
}

/* ─── KPI ──────────────────────────────────────────── */

export type KpiTone = "warm" | "blue" | "green" | "red" | "amber";

export function Kpi({
  label,
  value,
  tone = "warm",
  delta,
  hint,
  icon,
}: {
  label: string;
  value: number | string;
  tone?: KpiTone;
  delta?: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`vd-kpi vd-kpi-${tone}`}>
      <div className="vd-kpi-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="vd-kpi-body">
        <div className="vd-kpi-lbl">{label}</div>
        <div className="vd-kpi-val">{value}</div>
        {(delta || hint) && (
          <div className="vd-kpi-foot">
            {delta && <span className="vd-kpi-delta">{delta}</span>}
            {hint && <span className="vd-kpi-hint">{hint}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function KpiRow({ children }: { children: React.ReactNode }) {
  return <div className="vd-kpi-row">{children}</div>;
}

/* ─── Status chip ─────────────────────────────────── */

export type StatusKey = "Новая" | "Подтверждена" | "Отклонена" | string;

const STATUS_META: Record<string, { bg: string; fg: string; label: string }> = {
  Новая: { bg: "#dbeafe", fg: "#1e40af", label: "Новая" },
  Подтверждена: { bg: "#d1f0dd", fg: "#15693a", label: "Подтверждена" },
  Отклонена: { bg: "#fbdada", fg: "#a02b2b", label: "Отклонена" },
  Ожидает: { bg: "#fde9c3", fg: "#92520a", label: "Ожидает" },
};

export function StatusChip({ status }: { status: StatusKey }) {
  const m =
    STATUS_META[status] || { bg: "#e3ddcd", fg: "#5b574d", label: status };
  return (
    <span className="vd-chip" style={{ background: m.bg, color: m.fg }}>
      <span className="vd-chip-dot" style={{ background: m.fg }} />
      {m.label}
    </span>
  );
}

/* ─── App card (registration row) ─────────────────── */

export type CampKey = "kids" | "teens";

export const CAMPS_META: Record<
  CampKey,
  { label: string; icon: string; color: string; dates: string }
> = {
  kids: {
    label: "Детский",
    icon: "🌲",
    color: "#3a8a55",
    dates: "28 июня — 4 июля 2026",
  },
  teens: {
    label: "Подростковый",
    icon: "🔥",
    color: "#c25b3a",
    dates: "26 июля — 1 августа 2026",
  },
};

export function AppCard({
  application,
  onClick,
}: {
  application: {
    id: string;
    childName: string;
    childGender?: string;
    childAge: number;
    parentName: string;
    parentPhone: string;
    city: string;
    createdAt: string;
    status: string;
    camp?: string;
  };
  onClick?: () => void;
}) {
  const a = application;
  const stripeClass =
    a.childGender === "Мальчик"
      ? "vd-stripe-m"
      : a.childGender === "Девочка"
      ? "vd-stripe-f"
      : "vd-stripe-x";
  const camp = (a.camp as CampKey | undefined)
    ? CAMPS_META[a.camp as CampKey]
    : null;
  const ageLabel =
    a.childAge === 1
      ? "1 год"
      : a.childAge < 5
      ? `${a.childAge} года`
      : `${a.childAge} лет`;

  return (
    <button
      type="button"
      className="vd-app-card"
      onClick={onClick}
      aria-label={`Открыть заявку ${a.childName}`}
    >
      <div className={`vd-app-stripe ${stripeClass}`} />
      <div className="vd-app-body">
        <div className="vd-app-headline">
          <div className="vd-app-name">{a.childName}</div>
          <div className="vd-app-tags">
            {camp && (
              <span
                className="vd-tag"
                style={{
                  background: camp.color + "1a",
                  color: camp.color,
                }}
              >
                {camp.icon} {camp.label}
              </span>
            )}
            <span className="vd-tag-light">{ageLabel}</span>
          </div>
        </div>
        <div className="vd-app-cell">
          <span>Родитель</span>
          <strong>{a.parentName}</strong>
        </div>
        <div className="vd-app-cell">
          <span>Телефон</span>
          <strong className="vd-mono">{a.parentPhone}</strong>
        </div>
        <div className="vd-app-cell">
          <span>Город</span>
          <strong>{a.city}</strong>
        </div>
        <div className="vd-app-cell">
          <span>Подача</span>
          <strong className="vd-mono">
            {new Date(a.createdAt).toLocaleDateString("ru-RU")}
          </strong>
        </div>
        <div className="vd-app-status-cell">
          <StatusChip status={a.status} />
        </div>
      </div>
    </button>
  );
}

/* ─── Donut charts ────────────────────────────────── */

const C = 2 * Math.PI * 56;

export function GenderDonut({
  apps,
}: {
  apps: { childGender?: string }[];
}) {
  const m = apps.filter((a) => a.childGender === "Мальчик").length;
  const f = apps.filter((a) => a.childGender === "Девочка").length;
  const total = m + f;
  const denom = total || 1;
  const mPct = m / denom;
  const fPct = f / denom;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <svg
        width="170"
        height="170"
        viewBox="0 0 170 170"
        style={{ flexShrink: 0 }}
      >
        <circle
          cx="85"
          cy="85"
          r="56"
          fill="none"
          stroke="#eee5d4"
          strokeWidth="22"
        />
        {total > 0 && (
          <>
            <circle
              cx="85"
              cy="85"
              r="56"
              fill="none"
              stroke="#5d8aa8"
              strokeWidth="22"
              strokeDasharray={`${C * mPct} ${C}`}
              strokeLinecap="butt"
              transform="rotate(-90 85 85)"
            />
            <circle
              cx="85"
              cy="85"
              r="56"
              fill="none"
              stroke="#d28b5b"
              strokeWidth="22"
              strokeDasharray={`${C * fPct} ${C}`}
              strokeDashoffset={-C * mPct}
              transform="rotate(-90 85 85)"
            />
          </>
        )}
        <text
          x="85"
          y="80"
          textAnchor="middle"
          style={{ font: "700 28px Manrope", fill: "#2c2a26" }}
        >
          {total}
        </text>
        <text
          x="85"
          y="100"
          textAnchor="middle"
          style={{
            font: "500 11px Manrope",
            fill: "#8b867a",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          заявок
        </text>
      </svg>
      <div
        style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}
      >
        <DonutLegend
          dot="#5d8aa8"
          label="Мальчики"
          n={m}
          pct={Math.round(mPct * 100)}
        />
        <DonutLegend
          dot="#d28b5b"
          label="Девочки"
          n={f}
          pct={Math.round(fPct * 100)}
        />
      </div>
    </div>
  );
}

export function AgeDonut({ apps }: { apps: { childAge: number }[] }) {
  const buckets = [
    { label: "7–8 лет", range: [7, 8], color: "#d28b5b" },
    { label: "9–10 лет", range: [9, 10], color: "#c89028" },
    { label: "11–12 лет", range: [11, 12], color: "#5d8aa8" },
    { label: "13–14 лет", range: [13, 14], color: "#3a8a55" },
    { label: "15–17 лет", range: [15, 17], color: "#9b6d3f" },
  ].map((b) => ({
    ...b,
    count: apps.filter(
      (a) => a.childAge >= b.range[0] && a.childAge <= b.range[1]
    ).length,
  }));
  const total = buckets.reduce((s, b) => s + b.count, 0);
  const denom = total || 1;
  let acc = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <svg
        width="170"
        height="170"
        viewBox="0 0 170 170"
        style={{ flexShrink: 0 }}
      >
        <circle
          cx="85"
          cy="85"
          r="56"
          fill="none"
          stroke="#eee5d4"
          strokeWidth="22"
        />
        {buckets.map((b, i) => {
          if (b.count === 0) return null;
          const pct = b.count / denom;
          const dash = C * pct;
          const offset = -C * acc;
          acc += pct;
          return (
            <circle
              key={i}
              cx="85"
              cy="85"
              r="56"
              fill="none"
              stroke={b.color}
              strokeWidth="22"
              strokeDasharray={`${dash} ${C}`}
              strokeDashoffset={offset}
              transform="rotate(-90 85 85)"
            />
          );
        })}
        <text
          x="85"
          y="80"
          textAnchor="middle"
          style={{ font: "700 28px Manrope", fill: "#2c2a26" }}
        >
          {total}
        </text>
        <text
          x="85"
          y="100"
          textAnchor="middle"
          style={{
            font: "500 11px Manrope",
            fill: "#8b867a",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          детей
        </text>
      </svg>
      <div
        style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}
      >
        {buckets.map((b) => (
          <DonutLegend
            key={b.label}
            dot={b.color}
            label={b.label}
            n={b.count}
            pct={Math.round((b.count / denom) * 100)}
          />
        ))}
      </div>
    </div>
  );
}

function DonutLegend({
  dot,
  label,
  n,
  pct,
}: {
  dot: string;
  label: string;
  n: number;
  pct: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: dot,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          flex: 1,
          fontSize: 14,
          color: "#2c2a26",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontVariantNumeric: "tabular-nums",
          fontWeight: 700,
          color: "#2c2a26",
        }}
      >
        {n}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "#8b867a",
          minWidth: 38,
          textAlign: "right",
        }}
      >
        {pct}%
      </span>
    </div>
  );
}
