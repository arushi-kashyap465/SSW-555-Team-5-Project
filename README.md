# QR Attendance — Team 5

A QR-based attendance tracking web app.

- **Frontend**: static HTML/CSS/JS (`frontend/`) served by Firebase Hosting.
- **Backend**: Express API (`backend/`) deployed as a Firebase Cloud Function (`api`).
- **Database**: Firestore (collections: `users`, `courses`, `sessions`, `attendanceRecords`, `events`).

### Team
Arushi Kashyap, Owen Krupa, Nolan Hughes, Vinayak Ranjan

## User stories (implemented)

1. A student scans a QR code and their attendance is recorded (duplicate scans are ignored).
2. A teacher creates class sessions for a course and receives a QR to display.
3. A teacher views an attendance report (present / late / absent per student).

## Project layout

```
frontend/            Firebase Hosting (static)
  index.html         login + register
  dashboard.html     teacher + student dashboards
  scan.html          student check-in target of QR codes
  js/api.js          shared fetch client + auth storage
  styles.css

backend/             Firebase Cloud Functions source
  index.js           exports `api` HTTPS function wrapping Express
  src/
    app.js           Express app builder (no listen)
    server.js        local dev entrypoint
    config/          firebaseAdmin, firestoreCollections, settings
    data/            users, courses, sessions, attendance, events
    helpers/         validation, auth (JWT), qr-generation, attendance
    middleware/      loginRequired, requireRole, requestLogger
    routes/          users, courses, sessions, scan, events, health

firebase.json        hosting + functions + firestore config
firestore.rules      deny-all client (backend uses Admin SDK)
```

## Local development

```bash
# one-time
npm install                         # root dev-deps (firebase-tools)
npm install --prefix backend

# provide credentials for local backend
export GOOGLE_APPLICATION_CREDENTIALS=/abs/path/to/service-account.json
export JWT_SECRET="some-long-random-string"

# run Express on localhost:3001
npm run dev
```

Open `frontend/index.html` directly, OR serve both layers together with the
Firebase Emulator Suite:

```bash
npm run serve   # functions + hosting + firestore
```

The hosting emulator rewrites `/api/**` → the functions emulator, so the
exact same relative `/api/...` calls used in production also work locally.

## Deployment

```bash
firebase login
firebase use qr-based-attendance-app-86fbb     # or `firebase use --add`
firebase functions:secrets:set JWT_SECRET      # optional but recommended

npm run deploy
```

After deploy:

- Frontend: `https://<project-id>.web.app/`
- API:      `https://<project-id>.web.app/api/...` (rewritten to the `api` function)

## QR flow (end-to-end)

1. Teacher logs in and creates a course on `/dashboard.html`.
2. Teacher creates a session for that course. The backend generates a random
   token, stores it on the session doc, and returns a PNG data-URL plus the
   QR URL of the form
   `https://<host>/scan.html?sessionId=<id>&token=<token>`.
3. Teacher shows the QR in the browser (it appears in the dashboard).
4. A student scans with their phone — the QR URL opens `scan.html`.
5. `scan.html` requires login; if not signed in, it redirects to `/index.html`
   and comes back with the same URL via `?next=...`.
6. `scan.html` POSTs `{ token }` to `/api/scan/:sessionId`.
7. Backend validates the token, confirms the student is enrolled, dedupes on
   `(session_id, student_id)`, and writes an `attendanceRecords` doc.

## Known operational notes

- Firestore rules deny all client-side access. The backend (Admin SDK in
  Cloud Functions) bypasses rules, which is the secure default because no
  business logic lives in the browser.
- `/src` and `/public` are **deprecated**. They were the pre-restructure
  layout. All new work belongs in `/backend` and `/frontend`.
