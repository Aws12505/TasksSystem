# Work Sessions module — backend deployment guide

Branch: `feature/work-sessions` (repo `RnD-Experts-Team/TasksSystem`, app in `Tasks_Back/`).

This module adds the **Daily Work Sessions** workflow (plan at shift start → end-of-day review → admin reports, monthly ratings, PDF export, live admin view). It is purely additive: 3 new tables, new routes under `/api/work-sessions`, one new Reverb channel. The old frontend in `Tasks_Front/` is untouched.

Deploy the **backend first**, then the new frontend (`task-system` repo, see its own `WORK_SESSIONS_DEPLOYMENT.md`).

---

## 1. What changed

Existing files touched (3):

| File | Change |
|---|---|
| `Tasks_Back/routes/api.php` | `require __DIR__ . '/api/work-sessions.php';` |
| `Tasks_Back/routes/channels.php` | channel `work-sessions.admin` (needs `view all work sessions`) |
| `Tasks_Back/public/openapi.json` | new tags/paths/schemas appended (Scalar docs at `/api-docs`) |

New files (everything else): `database/migrations/2026_09_22_00000{1,2,3}_*`, `database/seeders/WorkSessionPermissionSeeder.php`, `app/Models/{WorkSession,WorkSessionItem,UserMonthlyRating}.php`, `app/Services/WorkSession/*`, `app/Http/Controllers/WorkSession/*`, `app/Http/Requests/WorkSession/*`, `app/Events/WorkSessionUpdated.php`, `app/Exceptions/WorkSessionException.php`, `resources/views/pdf/work-session-monthly*.blade.php`, `routes/api/work-sessions.php`, `tests/Feature/WorkSessions/*`, factories.

No new Composer packages (`composer.json` unchanged). PHP extensions already in the Dockerfile are enough (`zip` for the export, `gd` for dompdf).

## 2. New database objects

| Table | Purpose |
|---|---|
| `work_sessions` | one row per user per day (`unique(user_id, work_date)`), status `open` / `confirmed` |
| `work_session_items` | planned items, optional FK to `tasks` (`nullOnDelete`), outcome `pending/done/partial/not_done` |
| `user_monthly_ratings` | manual admin score 0–100 per user per (year, month) |

New permissions (guard `sanctum`), all granted to the `admin` role by the seeder:

`view all work sessions`, `manage work sessions`, `rate work sessions`, `view work session reports`, `export work session reports`

Employees need **no** new permission for their own sessions (auth only, like clocking/workspaces).

## 3. Environment variables to set/confirm

Edit the **host** file `Tasks_Back/.env` (docker-compose bind-mounts `./Tasks_Back` into every container, so this file overrides the one the Dockerfile copies from `.env.example`).

```env
# Broadcasting must go through Reverb for the live admin view.
# (.env.example still says "log" — with "log" the app works but nothing is pushed live.)
BROADCAST_CONNECTION=reverb

# Credentials the API uses to publish events to the Reverb server.
# Inside docker-compose the Reverb container is reachable as "reverb" on 6031.
REVERB_APP_ID=tasks
REVERB_APP_KEY=<choose-a-key>            # must equal VITE_REVERB_APP_KEY in the frontend build
REVERB_APP_SECRET=<choose-a-secret>
REVERB_HOST=reverb
REVERB_PORT=6031
REVERB_SCHEME=http

# Calendar day used for "today" (sessions, reports, PDFs). Default UTC.
COMPANY_TIMEZONE=Asia/Riyadh              # set to the company's timezone
```

Notes:
- `REVERB_*` on the backend describes how **PHP reaches the Reverb server** (internal). The frontend gets the **public** address separately (`VITE_REVERB_*`).
- If the public URL is served over HTTPS, the browser will use `wss://`; terminate TLS at the reverse proxy and forward to the Reverb container (see §6).
- `QUEUE_CONNECTION` is irrelevant for this module (events are `ShouldBroadcastNow`); the existing `queue` container is not required for it.

## 4. Deploy steps (docker-compose, as on the current server)

```bash
# 0. On the server, from the repo root (where docker-compose.yml is)
git fetch origin && git checkout feature/work-sessions && git pull   # or merge/tag as per your flow

# 1. Update Tasks_Back/.env as in §3

# 2. Rebuild + restart (vendor is inside the image; no new packages, but keep the image current)
docker compose up -d --build backend reverb queue

# 3. Run migrations (3 new tables) and seed the permissions
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --class=WorkSessionPermissionSeeder --force
docker compose exec backend php artisan permission:cache-reset

# 4. Clear cached config/routes (if you use config:cache / route:cache, re-run them afterwards)
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan route:clear
docker compose exec backend php artisan view:clear

# 5. Make sure the PDF temp dir can be created (export writes to storage/app/temp)
docker compose exec backend sh -c "mkdir -p storage/app/temp && chown -R www-data:www-data storage bootstrap/cache"
```

Without docker (plain PHP host): same commands without `docker compose exec backend`, then restart PHP-FPM and the Reverb process (`php artisan reverb:start --host=0.0.0.0 --port=<port>` under supervisor/systemd).

## 5. Verify

```bash
# 23 routes, all resolving
docker compose exec backend php artisan route:list --path=work-sessions

# Broadcast config really points at reverb
docker compose exec backend php artisan tinker --execute="echo config('broadcasting.default'), ' ', config('app.company_timezone');"

# Permissions exist
docker compose exec backend php artisan tinker --execute="echo \Spatie\Permission\Models\Permission::where('name','like','%work session%')->count();"   # expect 5
```

API smoke (replace host/token):

```bash
curl -s -H "Authorization: Bearer <token>" -H "Accept: application/json" https://<api-host>/api/work-sessions/today
```

Expect `{"success":true,"data":{"today":"YYYY-MM-DD","company_timezone":"...","session":null,...}}`.

Scalar docs: open `https://<api-host>/api-docs` — tags **Work Sessions**, **Work Sessions Admin**, **Work Session Reports**, **Monthly Ratings** should be listed.

Optional: run the module tests before deploying (needs `pdo_sqlite`):

```bash
php artisan test tests/Feature/WorkSessions
```

## 6. Reverb / websocket exposure

The admin "All Sessions" page subscribes to the **public** channel `work-sessions.admin` (same pattern as `clocking.manager`). For the browser to connect it needs a reachable websocket endpoint:

- **Direct port** (current compose maps host `6001` → container `6031`): frontend uses `VITE_REVERB_HOST=<api-host>`, `VITE_REVERB_PORT=6001`, `VITE_REVERB_SCHEME=http`. Only works on plain HTTP pages (mixed content blocks `ws://` from an `https://` page).
- **Behind nginx with TLS (recommended)**: proxy a path or subdomain to the Reverb container and set the frontend to `VITE_REVERB_HOST=ws.<domain>`, `VITE_REVERB_PORT=443`, `VITE_REVERB_SCHEME=https`.

```nginx
# example: wss://ws.example.com -> reverb container
server {
    listen 443 ssl;
    server_name ws.example.com;
    # ssl_certificate ...;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 3600;
        proxy_pass http://127.0.0.1:6001;
    }
}
```

If Reverb should only accept the frontend's origin, set `REVERB_ALLOWED_ORIGINS=https://app.example.com` (comma-separated). Default is `*`.

## 7. Give managers access (optional)

By default only the `admin` role gets the five permissions. To let a manager role see the admin pages, assign the relevant permissions through the **Roles** page in the frontend, or:

```bash
docker compose exec backend php artisan tinker --execute="\Spatie\Permission\Models\Role::findByName('manager','sanctum')->givePermissionTo(['view all work sessions','view work session reports']);"
docker compose exec backend php artisan permission:cache-reset
```

## 8. Rollback

```bash
docker compose exec backend php artisan migrate:rollback --step=3   # drops the 3 new tables (data loss!)
docker compose exec backend php artisan tinker --execute="\Spatie\Permission\Models\Permission::where('name','like','%work session%')->delete();"
docker compose exec backend php artisan permission:cache-reset
git checkout <previous-branch-or-tag> && docker compose up -d --build backend reverb
```

The three touched files (`routes/api.php`, `routes/channels.php`, `public/openapi.json`) revert with the checkout.

## 9. Behaviour notes for ops

- "Today" is computed in `COMPANY_TIMEZONE`; one session per user per calendar day. Changing the timezone later does not rewrite existing `work_date` values.
- Confirmed sessions are read-only for employees; only users with `manage work sessions` can reopen them.
- Reports count **confirmed** sessions unless `include_open=1` is passed; the monthly ratings page uses confirmed-only stats.
- PDF export builds files under `storage/app/temp/` and deletes them after the download; if the process is killed mid-export a `work-sessions-*` folder may remain and can be deleted safely.
- Open sessions from previous days are never auto-closed; users confirm them from **History**, admins can filter `status=open`.
