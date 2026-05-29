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
- Vercel CLI `v51.2.1`, installed globally at `/usr/local/bin/vercel`
  - ⚠️ Call it as **`vercel …`** (or the full path), **NOT `npx vercel`** —
    in this repo `npx vercel` collides with an npm script lookup and fails
    with `Missing script: "vercel"`.

---

## 4. Deploying (Vercel)

```bash
git add -A
git commit -m "your message"
git push                                # → triggers Vercel preview
vercel deploy --prod                    # promote to production (NOT `npx vercel`)
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
vercel env pull .env.vercel

# Deploy and tail  (use `vercel`, NOT `npx vercel` — see §3)
vercel deploy --prod
vercel logs https://kids-camp-portal.vercel.app --follow
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

## 9. Most recent state (as of 2026-05-29)

Last commit: **`61174e7`** — *Admin modal: fix input focus loss when editing
fields*. Working tree clean; everything below is **deployed to production**.

### ✅ Just fixed & shipped — edit-mode input focus loss

The "edit every field" feature (commit `edf3cfd`) had a bug: in edit mode the
input lost focus after **every** keystroke, forcing a re-click per character.

- **Root cause:** the `EF<K>` editable-field helper was defined *inside*
  `RegistrationModal` and rendered as a JSX element type (`<EF .../>`). Since
  `EF` got a new function identity on every render, React saw each keystroke's
  `<EF/>` as a *different component type*, unmounted/remounted the `<input>`,
  and dropped focus — the classic "component defined during render" anti-pattern.
- **Fix (commit `61174e7`):** call `EF` as a plain function — `{EF({ ... })}` —
  at all 40 sites instead of `<EF .../>`. It now returns a stable module-scope
  `<EditableField/>` element that React reconciles in place, so the input keeps
  focus. Pure refactor: every field's label/key binding, the `EditableField`
  renderer, `handleSave`, and `EDITABLE_KEYS` are **byte-identical** to before
  (verified by diff). The `EF` definition in
  [`RegistrationModal.tsx`](src/components/RegistrationModal.tsx) now carries a
  comment warning never to use it as `<EF/>` again.
- **Save was verified end-to-end** (local server, admin login, real PATCH):
  text, `childAge` string→int coercion (`"12"`→`12`), booleans, `yes/no`
  enums, payment method and address all round-trip correctly. Frontend
  `EDITABLE_KEYS` ⟷ API `ADMIN_EDITABLE` whitelists are in sync (the only API
  extras are `status` + `internalNotes`, which `handleSave` always sends).
- **Not yet done:** an in-browser re-test by the user on the live site (the
  automated local browser test was blocked by a sandbox `EPERM`; the fix is the
  canonical one and build + save are verified). If focus *still* drops after a
  hard refresh, look for any OTHER component defined inside `RegistrationModal`
  render, or a changing `key` on an input — not the `EF` pattern, which is gone.

> Note: `HANDOFF.md` itself was **not** part of the `61174e7` deploy commit
> (kept the deploy to just the functional fix per the user's request); this
> doc update lands separately.

---

### What works end-to-end (everything below is live)

- **Public form** (`/register`): multi-step wizard, two camps with full
  descriptions on the camp-choice step, age ranges (kids 6–12, teens 13–18),
  Latvian `Personas kods` (mobile shows full keyboard for the dash), declared
  + actual address (checkbox to copy), mandatory 2 pickup contacts
  (name/phone/relation), health questions incl. special traits / encephalitis
  vaccine / other-camps / swimming ability, payment = **Stripe or cash**
  (2-column on desktop, stacked on mobile; Stripe is *selected* on the form,
  the pay button appears on the success screen — no mid-form navigation),
  "add another child" pre-fills shared contacts/addresses. OG share preview
  says "Лагеря 2026".
- **Admin** (`/admin/*`): dashboard, all-registrations list, per-camp pages
  with gender + age donuts that **toggle between confirmed-only and all**
  applications, Команды drag-n-drop, Пользователи (SUPERADMIN). MENTOR limited
  to their teams; API enforces it. Mobile drawer + responsive layout.
- **Registration modal** ([`RegistrationModal.tsx`](src/components/RegistrationModal.tsx)):
  full detail view + **edit-mode for all ~41 fields** (focus bug fixed in
  `61174e7`), status change, internal notes, delete (SUPERADMIN).
- **Emails** (Gmail SMTP via nodemailer — [`send-confirmation.ts`](src/lib/email/send-confirmation.ts)):
  - On **submit** → short "Заявка получена, в обработке" acknowledgement,
    **no attachments**.
  - On **admin approval** (status → "Подтверждена") → "✓ Заявка одобрена"
    **with 3 PDF attachments** (Informācijas lapa, Līgums — note "нужно 2
    экземпляра", Pielikumi), payment-method-aware text, meeting details.
  - Sender: `Kristiana.vjatere@gmail.com` (FROM name "Kristiāna Vjatere ·
    Bērnu nometne 2026"). Creds in Vercel env `GMAIL_USER` /
    `GMAIL_APP_PASSWORD` — already set in prod.
- **PDF fill** ([`src/lib/pdf/fill-documents.ts`](src/lib/pdf/fill-documents.ts)):
  pdf-lib + fontkit + DejaVu Sans overlay; coordinates extracted exactly from
  the templates via pdfjs-dist; address auto-shrinks 9pt→8pt to avoid clipping.
  User has confirmed these look good.
- **Backups / durability** (the user is anxious about losing PII — a prior
  Netlify app wiped data after 30 days): Turso has no such policy; plus a
  GitHub Actions cron does a **weekly DB backup** and a **daily keepalive**.

### ⚠️ Hard constraints (do not violate)

- **Repo is PUBLIC** → never commit children's PII or DB dumps. `/tmp-backup/`
  is gitignored; keep it that way.
- Do **not** edit `src/generated/prisma/` (generated from the schema).
- Do **not** commit `dev.db` / `*.db-journal` / `.env` (already gitignored).
- Do **not** add a parent `Personas kods` field — the user explicitly said
  it's not needed.
- Turso schema changes: run `ALTER TABLE` against prod **and** update
  `prisma/schema.prisma` + `npx prisma generate` so they stay in sync. If the
  `turso` CLI session is expired, pull the token via
  `vercel env pull /tmp/.env.vercel-temp --environment=production` and run the
  ALTER through `@libsql/client`.

### Older "nice-to-have" backlog (not blocking)

- Admin topbar "search" input is decorative (disabled); could be wired up.
- `/admin/registrations/[id]` standalone page duplicates the modal layout.
- CSV export `/admin/registrations/export` doesn't take a `?camp=` filter yet.

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
