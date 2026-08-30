# Diario Intelligente

Tracker personale per nutrizione, allenamenti (log flessibile, non a scheda fissa),
abitudini e media (libri/film/serie), con viste aggregate settimanali/mensili.

**App**: https://frontend-production-9cd8.up.railway.app
**API**: https://backend-production-8e52.up.railway.app

## Stack

- **Backend**: Node.js + TypeScript + Express + Prisma ORM
- **Database**: PostgreSQL
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + React Router (hash routing)
- **Deploy**: Railway, tre servizi nel progetto `control1`:
  - `backend` — API Express (rootDirectory `/backend`)
  - `frontend` — sito statico buildato con Vite (rootDirectory `/frontend`)
  - `Postgres` — database gestito

`backend/` e `frontend/` sono due cartelle indipendenti, ciascuna con il
proprio `package.json`/lockfile — non è un npm workspace.

## Sviluppo locale

Il database usato in locale è lo stesso Postgres di Railway (nessun Docker),
raggiungibile tramite un TCP proxy pubblico già configurato sul servizio.

```bash
cd backend && npm install
cd frontend && npm install
```

Crea `backend/.env` partendo da `backend/.env.example` con la `DATABASE_URL`
del proxy Railway (`railway variable list --service Postgres` per recuperarla,
usando l'host/porta del TCP proxy invece di quello interno `.railway.internal`).

```bash
cd backend && npm run dev     # API su http://localhost:3001
cd frontend && npm run dev    # frontend su http://localhost:5173 (proxy verso :3001)
```

Migrazioni:

```bash
cd backend && npm run prisma:migrate   # crea/applica una nuova migration in dev
```

## Build di produzione

```bash
cd backend && npm run build && npm run prisma:deploy && npm start
cd frontend && npm run build   # output in frontend/dist, servito come sito statico
```

Il frontend in produzione chiama il backend tramite la variabile
`VITE_API_URL` (impostata a build-time su Railway con l'URL pubblico del
servizio `backend`); in locale resta vuota e passa dal proxy di Vite.

## Modello dati

- `daily_logs`: un record al giorno con kcal, macro e ore di sonno
- `media_logs`: libri/film/serie visti, più voci per giorno
- `exercises` / `exercise_logs`: catalogo esercizi + log delle singole serie
  (reps, peso, RIR, recupero) in tempo reale, senza concetto di "scheda"
- `habits` / `habit_logs`: abitudini buone/cattive, checkbox o conteggio
- `period_notes`: decisioni prese a fine settimana/mese (es. "aumenta volume
  gambe") collegate a una categoria e un periodo

## API principali

- `GET/POST /api/daily-logs`
- `GET/POST /api/media-logs`
- `GET/POST /api/exercises`, `POST /api/exercises/:id/logs`
- `GET /api/exercises/:id/history` — giorni dall'ultimo allenamento + storico
  recente per quell'esercizio
- `GET /api/exercise-logs?date=` — tutte le serie di un giorno (sessione di oggi)
- `GET/POST /api/habits`, `GET /api/habits/logs?date=`, `POST /api/habits/:id/logs`
- `GET /api/stats/muscle-volume?from=&to=` — volume allenante per gruppo muscolare
- `GET /api/stats/nutrition?from=&to=` — medie di kcal/macro/sonno nel periodo
- `GET/POST /api/period-notes`
- `DELETE` su `daily-logs/:id`, `media-logs/:id`, `exercise-logs/:id`,
  `habits/logs/:id` — per correggere errori di inserimento
