"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import AdminLayout from "@/components/AdminLayout";
import RegistrationModal from "@/components/RegistrationModal";
import { Hero } from "@/components/admin/primitives";

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

  // Drag-and-drop: id of the registration currently being dragged.
  const [draggingRegId, setDraggingRegId] = useState<string | null>(null);
  // Highlight which drop target is being hovered ("unassigned" or team id).
  const [dropHover, setDropHover] = useState<string | null>(null);

  // Filters for the "unassigned" section.
  const [filterGender, setFilterGender] = useState<"all" | Gender>("all");
  const [filterAge, setFilterAge] = useState<"all" | "7-8" | "9-10" | "11-12" | "13-14" | "15+">(
    "all"
  );

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
      <AdminLayout
        hero={<Hero title="Команды" subtitle="Загрузка..." />}
      >
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
      <AdminLayout
        hero={
          <Hero
            title="Мои команды"
            subtitle="Здесь вы видите детей, назначенных в ваши команды, и всю информацию из их анкет."
          />
        }
      >

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
    <AdminLayout
      hero={
        <Hero
          title="Команды"
          subtitle="Распределите подтверждённых детей по командам и назначьте наставников."
        />
      }
    >
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
                      draggingRegId={draggingRegId}
                      setDraggingRegId={setDraggingRegId}
                      dropHover={dropHover}
                      setDropHover={setDropHover}
                      registrationsById={registrations}
                    />
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {/* Unassigned confirmed children — table with filters + dropdown assign */}
      {(() => {
        const allUnassigned = registrations.filter(
          (r) =>
            r.camp === activeCamp &&
            r.status === "Подтверждена" &&
            !r.teamId
        );

        function inAgeBucket(age: number) {
          if (filterAge === "all") return true;
          if (filterAge === "7-8") return age >= 7 && age <= 8;
          if (filterAge === "9-10") return age >= 9 && age <= 10;
          if (filterAge === "11-12") return age >= 11 && age <= 12;
          if (filterAge === "13-14") return age >= 13 && age <= 14;
          if (filterAge === "15+") return age >= 15;
          return true;
        }

        const filtered = allUnassigned.filter((r) => {
          if (filterGender !== "all") {
            const code = REG_GENDER_TO_CODE[r.childGender || ""];
            if (code !== filterGender) return false;
          }
          if (!inAgeBucket(r.childAge)) return false;
          return true;
        });

        const isDropHover = dropHover === "unassigned";

        return (
          <section
            className={`bg-white rounded-lg shadow-sm border p-5 mb-6 transition-all ${
              isDropHover
                ? "border-amber-400 ring-2 ring-amber-200"
                : "border-gray-200"
            }`}
            onDragOver={(e) => {
              if (!draggingRegId) return;
              e.preventDefault();
              setDropHover("unassigned");
            }}
            onDragLeave={() => setDropHover(null)}
            onDrop={(e) => {
              e.preventDefault();
              if (!draggingRegId) return;
              assignChild(draggingRegId, null);
              setDraggingRegId(null);
              setDropHover(null);
            }}
          >
            <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
              <h3 className="font-semibold text-gray-800">
                Подтверждённые дети без команды ({allUnassigned.length})
              </h3>
              <span className="text-xs text-gray-500">
                Показано: {filtered.length}
              </span>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 mr-1">Пол:</span>
                {(
                  [
                    ["all", "Все"],
                    ["boy", "👦 Мальчики"],
                    ["girl", "👧 Девочки"],
                  ] as ["all" | Gender, string][]
                ).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setFilterGender(k)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      filterGender === k
                        ? "bg-[#1a73e8] text-white border-[#1a73e8]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 mr-1">Возраст:</span>
                {(
                  ["all", "7-8", "9-10", "11-12", "13-14", "15+"] as const
                ).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setFilterAge(k)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      filterAge === k
                        ? "bg-[#1a73e8] text-white border-[#1a73e8]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {k === "all" ? "Все" : `${k} лет`}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                {allUnassigned.length === 0
                  ? "Все подтверждённые дети распределены."
                  : "Нет детей, подходящих под выбранные фильтры."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Имя
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Пол
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Возраст
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Город
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Назначить в команду
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((r) => {
                      const code = REG_GENDER_TO_CODE[r.childGender || ""];
                      const eligibleTeams = teamsForCamp
                        .filter((t) => !code || t.gender === code)
                        .sort((a, b) => {
                          if (a.gender !== b.gender)
                            return a.gender === "boy" ? -1 : 1;
                          return a.number - b.number;
                        });
                      const isDragging = draggingRegId === r.id;
                      return (
                        <tr
                          key={r.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggingRegId(r.id);
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", r.id);
                          }}
                          onDragEnd={() => {
                            setDraggingRegId(null);
                            setDropHover(null);
                          }}
                          className={`hover:bg-amber-50 transition-colors cursor-grab active:cursor-grabbing ${
                            isDragging ? "opacity-40" : ""
                          }`}
                          title="Можно перетащить в команду"
                        >
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => setOpenRegId(r.id)}
                              className="text-[#1a73e8] hover:underline font-medium text-left"
                            >
                              {r.childName}
                            </button>
                          </td>
                          <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                            {r.childGender === "Мальчик" ? (
                              <span className="inline-flex items-center gap-1">
                                👦 Мальчик
                              </span>
                            ) : r.childGender === "Девочка" ? (
                              <span className="inline-flex items-center gap-1">
                                👧 Девочка
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-gray-700 tabular-nums">
                            {r.childAge || "—"}
                          </td>
                          <td className="px-3 py-2 text-gray-700">{r.city}</td>
                          <td className="px-3 py-2">
                            <select
                              value=""
                              onChange={(e) => {
                                const tid = e.target.value;
                                if (tid) assignChild(r.id, tid);
                              }}
                              className="border border-gray-300 rounded-md px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] min-w-[200px]"
                              disabled={eligibleTeams.length === 0}
                            >
                              <option value="">
                                {eligibleTeams.length === 0
                                  ? "Нет подходящих команд"
                                  : "— Выбрать команду —"}
                              </option>
                              {eligibleTeams.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {GENDER_LABEL[t.gender]} · №{t.number}
                                  {t.name ? ` «${t.name}»` : ""}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {draggingRegId && (
              <p className="text-xs text-amber-700 mt-3 italic">
                💡 Перетащите ребёнка на нужную команду или сюда, чтобы убрать
                из команды.
              </p>
            )}
          </section>
        );
      })()}

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
  draggingRegId,
  setDraggingRegId,
  dropHover,
  setDropHover,
  registrationsById,
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
  draggingRegId: string | null;
  setDraggingRegId: (id: string | null) => void;
  dropHover: string | null;
  setDropHover: (id: string | null) => void;
  registrationsById: Registration[];
}) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(team.name);
  const [showAdd, setShowAdd] = useState(false);

  const isDropHover = dropHover === team.id;
  // Only highlight if the dragged child has matching gender (or unknown).
  const dragged =
    draggingRegId
      ? registrationsById.find((r) => r.id === draggingRegId)
      : null;
  const draggedCode = dragged
    ? REG_GENDER_TO_CODE[dragged.childGender || ""]
    : null;
  const compatible = !draggedCode || draggedCode === team.gender;

  return (
    <div
      className={`bg-white rounded-lg border shadow-sm p-4 transition-all ${
        isDropHover && compatible
          ? "border-blue-400 ring-2 ring-blue-200 -translate-y-0.5"
          : isDropHover && !compatible
          ? "border-red-300 ring-2 ring-red-100"
          : "border-gray-200"
      }`}
      onDragOver={(e) => {
        if (!draggingRegId) return;
        e.preventDefault();
        setDropHover(team.id);
      }}
      onDragLeave={(e) => {
        // Only clear if leaving the element (not entering a child)
        if (e.currentTarget === e.target) setDropHover(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (!draggingRegId) return;
        if (!compatible) {
          setDraggingRegId(null);
          setDropHover(null);
          return;
        }
        onAssign(draggingRegId, team.id);
        setDraggingRegId(null);
        setDropHover(null);
      }}
    >
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
          <p
            className={`text-xs italic ${
              isDropHover && compatible
                ? "text-blue-600 font-medium"
                : "text-gray-400"
            }`}
          >
            {isDropHover && compatible
              ? "Отпустите, чтобы добавить сюда"
              : "Пусто."}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {members.map((m) => {
              const isDragging = draggingRegId === m.id;
              return (
                <li
                  key={m.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggingRegId(m.id);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", m.id);
                  }}
                  onDragEnd={() => {
                    setDraggingRegId(null);
                    setDropHover(null);
                  }}
                  className={`flex items-center justify-between gap-2 text-sm bg-gray-50 rounded px-2.5 py-1.5 cursor-grab active:cursor-grabbing transition-opacity ${
                    isDragging ? "opacity-40" : "hover:bg-gray-100"
                  }`}
                  title="Перетащите в другую команду"
                >
                  <span className="text-gray-400 select-none">⋮⋮</span>
                  <button
                    type="button"
                    onClick={() => onOpenRegistration(m.id)}
                    className="text-[#1a73e8] hover:underline truncate text-left flex-1"
                  >
                    {m.childName}
                  </button>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {m.childGender === "Мальчик"
                      ? "👦"
                      : m.childGender === "Девочка"
                      ? "👧"
                      : ""}
                    {m.childAge ? ` ${m.childAge} л.` : ""}
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
              );
            })}
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
