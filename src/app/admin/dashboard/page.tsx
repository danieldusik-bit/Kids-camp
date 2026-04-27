"use client";

import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import RegistrationModal from "@/components/RegistrationModal";
import {
  Hero,
  Kpi,
  KpiRow,
  AppCard,
  GenderDonut,
  AgeDonut,
} from "@/components/admin/primitives";

interface Registration {
  id: string;
  camp?: string;
  childName: string;
  childGender?: string;
  childAge: number;
  parentName: string;
  parentPhone: string;
  city: string;
  createdAt: string;
  status: string;
}

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/registrations");
    const data = await res.json();
    setRegistrations(data.registrations || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const total = registrations.length;
  const newCnt = registrations.filter((r) => r.status === "Новая").length;
  const conf = registrations.filter((r) => r.status === "Подтверждена").length;
  const rej = registrations.filter((r) => r.status === "Отклонена").length;

  const recent = registrations.slice(0, 6);

  return (
    <AdminLayout
      hero={
        <Hero
          title="Дашборд"
          subtitle="Сводка по обоим лагерям и последние заявки."
        />
      }
    >
      <KpiRow>
        <Kpi label="Всего заявок" value={total} tone="warm" icon="📋" />
        <Kpi
          label="Новые"
          value={newCnt}
          tone="blue"
          icon="✨"
          hint="ждут обработки"
        />
        <Kpi
          label="Подтверждённые"
          value={conf}
          tone="green"
          icon="✓"
          hint="оплачены"
        />
        <Kpi
          label="Отклонённые"
          value={rej}
          tone="red"
          icon="!"
          hint="требуют внимания"
        />
      </KpiRow>

      <div className="vd-charts">
        <section className="vd-card">
          <div className="vd-block-head">
            <h2>По полу</h2>
            <span className="vd-mute">все смены</span>
          </div>
          <GenderDonut apps={registrations} />
        </section>
        <section className="vd-card">
          <div className="vd-block-head">
            <h2>По возрасту</h2>
            <span className="vd-mute">все смены</span>
          </div>
          <AgeDonut apps={registrations} />
        </section>
      </div>

      <section className="vd-block">
        <div className="vd-block-head">
          <h2>Последние заявки</h2>
          <a href="/admin/registrations" className="vd-link">
            Все →
          </a>
        </div>
        {loading ? (
          <div className="vd-empty">Загрузка...</div>
        ) : recent.length === 0 ? (
          <div className="vd-empty">Заявок пока нет.</div>
        ) : (
          <div className="vd-app-list">
            {recent.map((r) => (
              <AppCard
                key={r.id}
                application={r}
                onClick={() => setOpenId(r.id)}
              />
            ))}
          </div>
        )}
      </section>

      <RegistrationModal
        registrationId={openId}
        onClose={() => setOpenId(null)}
        onChanged={refresh}
        onDeleted={refresh}
      />
    </AdminLayout>
  );
}
