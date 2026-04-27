"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import AdminLayout from "@/components/AdminLayout";
import RegistrationModal from "@/components/RegistrationModal";

type Camp = "kids" | "teens";
type Gender = "boy" | "girl";

interface Team {
  id: string;
  camp: Camp;
  gender: Gender;
  number: number;
  name: string;
  leaderId: string | null;
}

interface Mentor {
  id: string;
  name: string;
  email: string;
}

interface Registration {
  id: string;
  camp?: string;
  childName: string;
  childGender?: string;
  childDOB: string;
  childAge: number;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  city: string;
  status: string;
  teamId?: string | null;
  groupWith?: string;
  hasAllergies?: boolean;
  allergiesDetails?: string;
  hasChronicIllness?: boolean;
  chronicDetails?: string;
  takesMedication?: boolean;
  medicationDetails?: string;
  physicalActivity?: string;
  physicalLimitations?: string;
  dietRestrictions?: string;
  dietDetails?: string;
  additionalInfo?: string;
}

const CAMP_LABEL: Record<Camp, string> = {
  kids: "🏕️ Детский лагерь (28.06 – 4.07)",
  teens: "🔥 Подростковый лагерь (26.07 – 1.08)",
};

const GENDER_LABEL: Record<Gender, string> = {
  boy: "👦 Мальчики",
  girl: "👧 Девочки",
};

const REG_GENDER_TO_CODE: Record<string, Gender> = {
  Мальчик: "boy",
  Девочка: "girl",
};

export default function TeamsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isMentor = role === "MENTOR";
  const canManage = role === "SUPERADMIN" || role === "MANAGER";

  const [teams, setTeams] = useState<Team[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCamp, setActiveCamp] = useState<Camp>("kids");
  const [openRegId, setOpenRegId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const reqs: Promise<any>[] = [
      fetch("/api/admin/teams").then((r) => r.json()),
      fetch("/api/admin/registrations").then((r) => r.json()),
    ];
    if (canManage)
      reqs.push(fetch("/api/admin/mentors").then((r) => r.json()));

    const [t, r, m] = await Promise.all(reqs);
    setTeams(t.teams || []);
    setRegistrations(r.registrations || []);
    if (canManage) setMentors(m.mentors || []);
    setLoading(false);
  }, [canManage]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!session) return null;
  if (loading) {
    return (
      <AdminLayout>
        <p className="text-gray-500">Загрузка...</p>
      </AdminLayout>
    );
  }

  // ----- MENTOR VIEW -----
  if (isMentor) {
    const myTeams = teams; // server already filtered to leaderId=me
    const childrenByTeam = new Map<string, Registration[]>();
    for (const r of registrations) {
      if (!r.teamId) continue;
      if (!childrenByTeam.has(r.teamId)) childrenByTeam.set(r.teamId, []);
      childrenByTeam.get(r.teamId)!.push(r);
    }

    return (
      <AdminLayout>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Мои команды
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Здесь вы видите детей, назначенных в ваши команды, и всю информацию
            из их анкет.
          </p>
        </div>

        {myTeams.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-500">
            Вам пока не назначены команды. Менеджер скоро добавит вас как лидера.
          </div>
        )}

        <div className="flex flex-col gap-6">
          {myTeams.map((team) => {
            const members = childrenByTeam.get(team.id) || [];
            return (
              <section
                key={team.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <header className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      {CAMP_LABEL[team.camp]} · {GENDER_LABEL[team.gender]}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Команда №{team.number}
                      {team.name && (
                        <span className="text-gray-500 font-normal ml-2">
                          «{team.name}»
                        </span>
                      )}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    Детей: <strong>{members.length}</strong>
                  </span>
                </header>

                <div className="divide-y">
                  {members.length === 0 ? (
                    <p className="p-5 text-sm text-gray-500">
                      В команде пока никого нет.
                    </p>
                  ) : (
                    members.map((m) => (
                      <MemberCard
                        key={m.id}
                        registration={m}
                        onOpen={() => setOpenRegId(m.id)}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <RegistrationModal
          registrationId={openRegId}
          onClose={() => setOpenRegId(null)}
        />
      </AdminLayout>
    );
  }

  // ----- MANAGER / SUPERADMIN VIEW -----

  const teamsForCamp = teams.filter((t) => t.camp === activeCamp);
  const eligibleByGender = (g: Gender) =>
    registrations.filter(
      (r) =>
        r.camp === activeCamp &&
        r.status === "Подтверждена" &&
        REG_GENDER_TO_CODE[r.childGender || ""] === g
    );

  async function createTeam(
    camp: Camp,
    gender: Gender,
    number: number
  ): Promise<void> {
    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ camp, gender, number }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Не удалось создать команду");
      return;
    }
    await refresh();
  }

  async function setLeader(teamId: string, leaderId: string | null) {
    await fetch(`/api/admin/teams/${teamId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaderId }),
    });
    await refresh();
  }

  async function setTeamName(teamId: string, name: string) {
    await fetch(`/api/admin/teams/${teamId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await refresh();
  }

  async function deleteTeam(teamId: string) {
    if (!confirm("Удалить команду? Дети станут нераспределёнными."))
      return;
    await fetch(`/api/admin/teams/${teamId}`, { method: "DELETE" });
    await refresh();
  }

  async function assignChild(regId: string, teamId: string | null) {
    await fetch(`/api/admin/registrations/${regId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    await refresh();
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Команды</h2>
      </div>

      {/* Camp tabs */}
      <div className="flex gap-2 mb-6">
        {(["kids", "teens"] as Camp[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActiveCamp(c)}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              activeCamp === c
                ? "bg-[#1a73e8] text-white border-[#1a73e8]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {CAMP_LABEL[c]}
          </button>
        ))}
      </div>

      {/* Per-gender sections */}
      {(["boy", "girl"] as Gender[]).map((g) => {
        const list = teamsForCamp
          .filter((t) => t.gender === g)
          .sort((a, b) => a.number - b.number);
        const usedNumbers = new Set(list.map((t) => t.number));
        const nextNumber =
          [...Array(99)].findIndex((_, i) => !usedNumbers.has(i + 1)) + 1;
        const eligible = eligibleByGender(g);

        return (
          <section key={g} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                {GENDER_LABEL[g]}
              </h3>
              <button
                type="button"
                onClick={() => createTeam(activeCamp, g, nextNumber)}
                className="text-sm text-[#1a73e8] hover:underline font-medium"
              >
                + Добавить команду №{nextNumber}
              </button>
            </div>

            {list.length === 0 ? (
              <p className="text-sm text-gray-500 bg-white border rounded-lg p-5">
                Команд ещё нет. Нажмите «Добавить команду» чтобы создать
                первую.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {list.map((team) => {
                  const members = registrations.filter(
                    (r) => r.teamId === team.id
                  );
                  const free = eligible.filter((r) => !r.teamId);
                  return (
                    <TeamCard
                      key={team.id}
                      team={team}
                      mentors={mentors}
                      members={members}
                      free={free}
                      onLeader={setLeader}
                      onName={setTeamName}
                      onDelete={() => deleteTeam(team.id)}
                      onAssign={assignChild}
                      onOpenRegistration={(id) => setOpenRegId(id)}
                      canDelete={role === "SUPERADMIN"}
                    />
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {/* Unassigned eligible children */}
      <section className="bg-white rounded-lg shadow-sm border p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">
          Подтверждённые дети без команды (
          {registrations.filter(
            (r) =>
              r.camp === activeCamp &&
              r.status === "Подтверждена" &&
              !r.teamId
          ).length}
          )
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          В этот список попадают дети со статусом «Подтверждена», которым
          ещё не назначена команда.
        </p>
        <div className="flex flex-wrap gap-2">
          {registrations
            .filter(
              (r) =>
                r.camp === activeCamp &&
                r.status === "Подтверждена" &&
                !r.teamId
            )
            .map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setOpenRegId(r.id)}
                className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium hover:bg-amber-100"
                title="Открыть карточку"
              >
                {r.childName}
                {r.childGender === "Мальчик"
                  ? " 👦"
                  : r.childGender === "Девочка"
                  ? " 👧"
                  : ""}
                {r.childAge ? ` · ${r.childAge}` : ""}
              </button>
            ))}
          {registrations.filter(
            (r) =>
              r.camp === activeCamp &&
              r.status === "Подтверждена" &&
              !r.teamId
          ).length === 0 && (
            <p className="text-sm text-gray-500">
              Все подтверждённые дети распределены.
            </p>
          )}
        </div>
      </section>

      <RegistrationModal
        registrationId={openRegId}
        onClose={() => setOpenRegId(null)}
        onChanged={refresh}
        onDeleted={refresh}
      />
    </AdminLayout>
  );
}

function TeamCard({
  team,
  mentors,
  members,
  free,
  onLeader,
  onName,
  onDelete,
  onAssign,
  onOpenRegistration,
  canDelete,
}: {
  team: Team;
  mentors: Mentor[];
  members: Registration[];
  free: Registration[];
  onLeader: (id: string, leaderId: string | null) => void;
  onName: (id: string, name: string) => void;
  onDelete: () => void;
  onAssign: (regId: string, teamId: string | null) => void;
  onOpenRegistration: (id: string) => void;
  canDelete: boolean;
}) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(team.name);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-gray-500">
            Команда №{team.number} · {GENDER_LABEL[team.gender]}
          </div>
          {editingName ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название (опционально)"
                className="text-sm border border-gray-300 rounded px-2 py-1 flex-1 min-w-0"
              />
              <button
                onClick={async () => {
                  await onName(team.id, name);
                  setEditingName(false);
                }}
                className="text-xs text-[#1a73e8] font-medium"
              >
                ОК
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="text-base font-semibold text-gray-800 hover:underline"
              title="Изменить название"
            >
              {team.name || `Команда №${team.number}`}
            </button>
          )}
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-xs text-red-600 hover:text-red-700"
            title="Удалить команду"
          >
            Удалить
          </button>
        )}
      </div>

      {/* Leader picker */}
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Наставник</label>
        <select
          value={team.leaderId || ""}
          onChange={(e) => onLeader(team.id, e.target.value || null)}
          className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-sm bg-white"
        >
          <option value="">— Не назначен —</option>
          {mentors.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.email})
            </option>
          ))}
        </select>
      </div>

      {/* Members */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">
            Дети в команде ({members.length})
          </span>
          {free.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAdd((v) => !v)}
              className="text-xs text-[#1a73e8] font-medium hover:underline"
            >
              {showAdd ? "Свернуть" : "+ Добавить"}
            </button>
          )}
        </div>

        {members.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Пусто.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-2 text-sm bg-gray-50 rounded px-2.5 py-1.5"
              >
                <button
                  type="button"
                  onClick={() => onOpenRegistration(m.id)}
                  className="text-[#1a73e8] hover:underline truncate text-left"
                >
                  {m.childName}
                </button>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {m.childAge ? `${m.childAge} л.` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => onAssign(m.id, null)}
                  title="Убрать из команды"
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {showAdd && free.length > 0 && (
          <div className="mt-2 border-t border-dashed pt-2 flex flex-wrap gap-1.5">
            {free.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onAssign(r.id, team.id)}
                className="text-xs px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                + {r.childName}
                {r.childAge ? ` · ${r.childAge}` : ""}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberCard({
  registration,
  onOpen,
}: {
  registration: Registration;
  onOpen: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const r = registration;

  return (
    <div className="px-5 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpen}
            className="text-base font-semibold text-[#1a73e8] hover:underline text-left"
          >
            {r.childName}
          </button>
          <div className="text-xs text-gray-500 mt-0.5">
            {r.childGender || "—"} ·{" "}
            {r.childAge ? `${r.childAge} лет` : "возраст ?"} · {r.city}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-gray-500 hover:text-gray-700 flex-shrink-0"
        >
          {expanded ? "Свернуть ▲" : "Подробнее ▼"}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <Info
            label="Родитель"
            value={
              <>
                {r.parentName}
                <br />
                <a
                  href={`tel:+371${r.parentPhone}`}
                  className="text-[#1a73e8] hover:underline"
                >
                  +371 {r.parentPhone}
                </a>
                <br />
                <a
                  href={`mailto:${r.parentEmail}`}
                  className="text-[#1a73e8] hover:underline break-all"
                >
                  {r.parentEmail}
                </a>
              </>
            }
          />
          <Info label="Дата рождения" value={r.childDOB} />
          {r.groupWith && (
            <Info label="В одной группе с" value={r.groupWith} />
          )}
          <Info
            label="Аллергии"
            value={
              r.hasAllergies
                ? `Да${r.allergiesDetails ? " — " + r.allergiesDetails : ""}`
                : "Нет"
            }
          />
          <Info
            label="Хронические"
            value={
              r.hasChronicIllness
                ? `Да${r.chronicDetails ? " — " + r.chronicDetails : ""}`
                : "Нет"
            }
          />
          <Info
            label="Медикаменты"
            value={
              r.takesMedication
                ? `Да${r.medicationDetails ? " — " + r.medicationDetails : ""}`
                : "Нет"
            }
          />
          <Info
            label="Активность"
            value={
              r.physicalActivity === "С ограничениями"
                ? `С ограничениями${r.physicalLimitations ? " — " + r.physicalLimitations : ""}`
                : r.physicalActivity || "—"
            }
          />
          <Info
            label="Питание"
            value={
              r.dietRestrictions === "другое"
                ? `Другое${r.dietDetails ? " — " + r.dietDetails : ""}`
                : r.dietRestrictions || "—"
            }
          />
          {r.additionalInfo && (
            <Info label="Доп. информация" value={r.additionalInfo} />
          )}
        </div>
      )}
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <div className="text-sm text-gray-800 whitespace-pre-wrap">{value}</div>
    </div>
  );
}
