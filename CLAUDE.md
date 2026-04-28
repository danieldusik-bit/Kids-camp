# Kids Camp Portal — instructions for Claude Code

Краткий, проектно-специфичный workflow для агентов в этом репо.
Полный quick-start — см. [HANDOFF.md](./HANDOFF.md).

---

## graphify

В этом проекте используется **graphify** для навигации по архитектуре.
Артефакты лежат в `graphify-out/` (gitignored).

### Когда читать граф (перед тем как отвечать или править)

Прежде чем отвечать на любой из этих типов вопросов — **сначала прочитай
`graphify-out/GRAPH_REPORT.md`** (god nodes + структура сообществ), а если
есть `graphify-out/wiki/index.md` — навигируй вики, не raw-файлы:

- «как устроена админка / роли / role-gating»
- «как public form шлёт данные в API»
- «что использует `prisma`-клиент / схему»
- «откуда берутся данные на странице X»
- любые рефакторинги, затрагивающие 2+ модуля

Для точечных правок (одна страница, один компонент) — граф не нужен,
можно идти напрямую через Read/Grep.

### Когда обновлять граф

Запускай `npm run graph:update` (или `graphify update .`) **после**
любой сессии, в которой ты изменил файлы в:

- `prisma/schema.prisma` — меняется доменная модель
- `src/lib/**` — `prisma.ts`, `auth.ts`, `camp/*` (god-nodes уровня lib)
- `src/app/api/**` — все role-gated эндпоинты
- `src/components/AdminLayout.tsx`, `src/components/RegistrationModal.tsx`
- `src/app/admin/**/page.tsx` — добавил/удалил страницу админки

Для одиночных косметических правок (Tailwind-классы, тексты) обновлять
граф не обязательно. `update` дешёвый — AST-only, без вызовов API.

### Первый запуск (если `graphify-out/` пустой)

```bash
npm run graph:scan        # graphify . --wiki  → строит вики + GRAPH_REPORT.md
```

Если `graphify` CLI не установлен — `/graphify` (slash-команда) сам
поставит пакет через pip.

### Ожидаемые god-nodes этого репо

При первом скане ожидай высокий centrality у:

- `prisma/schema.prisma` (Registration, Team, User, TeamMember)
- `src/lib/prisma.ts` (Prisma client + libsql adapter)
- `src/lib/auth.ts` (NextAuth options, role в JWT)
- `src/lib/camp/useCampForm.ts` (state-хук публичной формы)
- `src/components/AdminLayout.tsx` (role-aware nav, drawer)
- `src/components/RegistrationModal.tsx` (общий detail-view)
- `src/app/api/register/route.ts` (точка входа публичной формы)

Ожидаемые сообщества:

1. **Public form** — `src/app/register`, `src/components/camp/*`,
   `src/lib/camp/*`, `src/app/api/register`
2. **Admin pages** — `src/app/admin/**`, `src/components/AdminLayout.tsx`,
   `src/components/admin/primitives.tsx`
3. **Admin API (role-gated)** — `src/app/api/admin/**`, `src/lib/auth.ts`
4. **Persistence** — `prisma/`, `src/lib/prisma.ts`, `src/generated/prisma`

Если первый граф этому не соответствует — это сигнал, что архитектура
дрейфует, а не что граф «неправильный».

---

## Прочее

- НЕ редактируй `src/generated/prisma/` — генерится из `prisma/schema.prisma`.
- НЕ коммить `dev.db` / `*.db-journal` / `.env` (уже в .gitignore).
- Деплой: `git push` → preview, `npx vercel deploy --prod` → продакшен.
- Учётка для локального админа: `admin@camp.com` / `Admin1234!`.
