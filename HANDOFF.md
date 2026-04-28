# Kids Camp Portal — Handoff / Quick-start

A short, opinionated guide so a fresh Claude Code session (on any account)
can get productive on this project in under 5 minutes.

---

## 1. What this project is

**Two-camp registration portal** for "Летние лагеря ц. Храм Спасения" 2026:

- **Public form** at `/register` — multi-step wizard (Лагерь → Родитель →
  Ребёнок → Здоровье → Оплата → Подтверждение). Saves to a Turso (libSQL) DB.
- **Admin panel** at `/admin/*` with role-aware nav:
  - **SUPERADMIN / MANAGER** — Дашборд, Все заявки, Детский лагерь,
    Подростковый лагерь, Команды (+ Пользователи for SUPERADMIN)
  - **MENTOR** — only Команды (their own teams' rosters)
  - **VIEWER** — read-only
- Hosted on Vercel: **https://kids-camp-portal.vercel.app**

### Stack

- **Next.js 14 (App Router)** + **TypeScript** + **Tailwind CSS**
- **Prisma 7** (new `prisma-client` generator → `src/generated/prisma`)
- **Turso (libSQL)** in production, local SQLite (`dev.db`) in dev
  - Adapter: `@prisma/adapter-libsql/web` for Vercel serverless
- **NextAuth.js 4** (JWT strategy, credentials provider, bcryptjs v3 ESM)
- Deployed via Vercel CLI

---

## 2. Where everything lives

```
src/
├── app/
│   ├── register/page.tsx          # Public wizard
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── registrations/page.tsx        # all registrations list
│   │   ├── registrations/[id]/page.tsx   # standalone detail (also via modal)
│   │   ├── camps/[camp]/page.tsx         # per-camp page (kids|teens) + charts
│   │   ├── teams/page.tsx                # team management + drag-n-drop
│   │   ├── users/page.tsx                # SUPERADMIN only
│   │   └── login/page.tsx
│   └── api/
│       ├── register/route.ts             # public POST
│       ├── auth/[...nextauth]/route.ts
│       └── admin/                        # everything role-gated
│           ├── stats/, registrations/, registrations/[id]/, registrations/export/
│           ├── teams/, teams/[id]/
│           ├── mentors/                  # list MENTOR users (manager+)
│           └── users/, users/[id]/
├── components/
│   ├── AdminLayout.tsx              # role-aware sidebar + drawer (mobile)
│   ├── RegistrationModal.tsx        # popup detail used in dashboard / lists / teams
│   ├── PieChart.tsx                 # SVG donut for camp pages
│   ├── admin/primitives.tsx         # Hero, Kpi, AppCard, GenderDonut, AgeDonut
│   └── camp/                        # public-form scaffold (Banner, SideNav,
│                                     #   Footer, Success, fields/, steps/)
├── lib/
│   ├── prisma.ts                    # Prisma client w/ libsql/web adapter
│   ├── auth.ts                      # NextAuth options (session.user.id + role)
│   └── camp/
│       ├── camp.ts                  # CAMPS, FormData, INITIAL_DATA, CAMP_RULES
│       ├── validation.ts
│       └── useCampForm.ts           # the form state hook (also POSTs to API)
├── styles/admin.css                 # admin design tokens + responsive rules
└── generated/prisma/                # do NOT edit — produced by `prisma generate`

prisma/
├── schema.prisma
├── seed.ts                          # creates SUPERADMIN admin@camp.com / Admin1234!
└── migrations/

prisma.config.ts                     # Prisma v7 config (datasource URL, seed cmd)
public/banner.jpeg                   # hero image (cache-busted via ?v=2)
```

---

## 3. First-time setup on this machine

The repo is already cloned at **`~/Documents/Kids camp portal/`**. If you ever
need a clean re-clone:

```bash
cd ~/Documents
git clone https://github.com/danieldusik-bit/Kids-camp.git "Kids camp portal"
cd "Kids camp portal"
```

```bash
# 1. Install
npm install                          # postinstall runs `prisma generate`

# 2. Local env file (NOT committed)
cat > .env <<'EOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="kids-camp-secret-2026"
NEXTAUTH_URL="http://localhost:3000"
EOF

# 3. Local DB + seed admin
DATABASE_URL="file:dev.db" npx prisma db push
DATABASE_URL="file:dev.db" npx prisma db seed     # → admin@camp.com / Admin1234!

# 4. Run
npm run dev          # http://localhost:3000
```

> **Local admin login:** `admin@camp.com` / `Admin1234!`

### Tool versions in use

- Node `v24.14.0` (any modern Node ≥20 works)
- npm `11.x`
- Turso CLI `v1.0.20` (only needed for production DB ops — see §6)
- Vercel CLI (installed via plugin, called as `npx vercel`)

---

## 4. Deploying (Vercel)

```bash
git add -A
git commit -m "your message"
git push                                # → triggers Vercel preview
npx vercel deploy --prod                # promote to production
```

Live URL: **https://kids-camp-portal.vercel.app**

### Vercel env vars (already set on the project — don't re-add unless you
moved the project)

| Name | Notes |
|------|-------|
| `TURSO_DATABASE_URL` | `libsql://kids-camp-danieldusik-bit.aws-eu-west-1.turso.io` |
| `TURSO_AUTH_TOKEN` | secret |
| `NEXTAUTH_SECRET` | same value can be reused locally |
| `NEXTAUTH_URL` | `https://kids-camp-portal.vercel.app` |

`src/lib/prisma.ts` automatically uses `@prisma/adapter-libsql/web` when
`TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` are present.

---

## 5. Database (Turso) — production

```bash
turso auth login                                    # one-time per machine
turso db list                                       # confirm "kids-camp" is there
turso db shell kids-camp ".schema Registration"
turso db shell kids-camp ".schema Team"
```

### Migrating schema to Turso

`prisma db push` works against a libSQL URL but in practice we've been
adding columns by hand to keep migrations simple:

```bash
turso db shell kids-camp <<'SQL'
ALTER TABLE "Registration" ADD COLUMN "newField" TEXT NOT NULL DEFAULT '';
SQL
```

Always update **`prisma/schema.prisma`** in parallel and run
`npx prisma generate` so the client matches.

### Re-seed admin (one-time)

If the production DB is empty, hit the Turso shell and create a user
directly:

```sql
INSERT INTO User (id, name, email, passwordHash, role, isActive, createdAt)
VALUES ('superadmin001', 'Admin', 'admin@camp.com',
        '<bcrypt-hash-of-Admin1234!>', 'SUPERADMIN', 1, CURRENT_TIMESTAMP);
```

Or run `prisma db seed` against `DATABASE_URL=libsql://...` with the auth
token in the env (slower).

---

## 6. Useful scripts & one-liners

```bash
# Dev
npm run dev                                 # local server

# Lint / typecheck via build
npm run build

# Reset local DB
rm dev.db dev.db-journal
DATABASE_URL="file:dev.db" npx prisma db push
DATABASE_URL="file:dev.db" npx prisma db seed

# Pull Vercel env into a local file (review only)
npx vercel env pull .env.vercel

# Deploy and tail
npx vercel deploy --prod
npx vercel logs https://kids-camp-portal.vercel.app --follow
```

---

## 7. Important services & accounts

| Service | URL / value |
|---------|-------------|
| GitHub repo | `https://github.com/danieldusik-bit/Kids-camp` |
| Vercel project | `danieldusik-bits-projects/kids-camp-portal` |
| Turso DB | `kids-camp` (group `default`, `aws-eu-west-1`) |
| Production URL | `https://kids-camp-portal.vercel.app` |
| Camp coordinator | Эсфирь · 27626010 |
| Bank (ziedojums) | `Rīgas Misiones Baptistu Draudze` `LV80UNLA0050011859310` |

---

## 8. Working with Claude Code on this repo

The personal `~/.claude/CLAUDE.md` already enables the **graphify** skill and
this project's `CLAUDE.md` (in repo root) also references it. No extra setup
required — Claude Code on the new account will pick up both automatically.

If you want graphify to work fully:

```bash
cd ~/Documents/"Kids camp portal"
graphify update .          # or `graphify .` for first-time scan
```

Generated artifacts go to `graphify-out/` (gitignored).

### What Claude already knows (from project `CLAUDE.md`)

- Read `graphify-out/GRAPH_REPORT.md` before architecture questions
- Run `graphify update .` after editing files in a long session

### Suggested first prompt on the new account

```
You are continuing the Kids Camp Portal at ~/Documents/Kids camp portal.
Read HANDOFF.md and the latest 5 commits, then summarize where we left off.
```

---

## 9. Most recent state (as of this handoff)

Last commit: **`0edcde6`** — *Mobile responsive admin panel + slide-out
sidebar drawer*.

What works end-to-end:

- Public form (6 steps, two-camp choice, latviešu name placeholders, summary
  step with "Изменить" jump-back, success screen with mailto + reset)
- Admin: dashboard with stats + recent table, all-registrations list,
  per-camp pages with gender + age donut charts, Команды with drag-n-drop
  + filterable unassigned table, Пользователи (SUPERADMIN)
- MENTOR role limited to their teams' rosters; API enforces this
- Mobile drawer + responsive admin layout

### Known small things (next up if you want)

- The "search" input in the admin topbar is decorative (disabled). It's
  hidden on mobile already; on desktop it could be wired up to filter the
  current page.
- `/admin/registrations/[id]` standalone page is still rendered server-side;
  the modal duplicates most of its layout. Could be unified later.
- CSV export from `/admin/registrations/export` doesn't yet take a `?camp=`
  filter (the camp pages build their CSV client-side).

---

## 10. Backup

A clean tarball of the repo (no `node_modules`, no `.next`, no `dev.db`) was
saved to:

```
~/Desktop/kids-camp-backups/kids-camp-portal_2026-04-27_185230_31aa80e.tar.gz
```

GitHub itself is the most up-to-date source. Vercel keeps every previous
deployment so rollback is one click.

— end of handoff —
