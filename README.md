# Diario Intelligente

Tracker personale per nutrizione, allenamenti (log flessibile, non a scheda fissa),
abitudini e media (libri/film/serie), con viste aggregate settimanali/mensili.

## Stack

- **Backend**: Node.js + TypeScript + Express + Prisma ORM
- **Database**: PostgreSQL
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Deploy**: Railway (un unico servizio: Express serve sia le API sia i file
  statici del frontend buildato) + Postgres gestito

Monorepo npm workspaces: `backend/` e `frontend/`.

## Sviluppo locale

Il database usato in locale è lo stesso Postgres di Railway (nessun Docker),
raggiungibile tramite un TCP proxy pubblico già configurato sul servizio.

```bash
npm install               # installa entrambi i workspace dalla root
```

Crea `backend/.env` partendo da `backend/.env.example` con la `DATABASE_URL`
del proxy Railway (`railway variable list --service Postgres` per recuperarla,
usando l'host/porta del TCP proxy invece di quello interno `.railway.internal`).

```bash
npm run dev --workspace=backend    # API su http://localhost:3001
npm run dev --workspace=frontend   # frontend su http://localhost:5173 (proxy verso :3001)
```

Migrazioni:

```bash
npm run prisma:migrate --workspace=backend   # crea/applica una nuova migration in dev
```

## Build di produzione

```bash
npm run build --workspace=frontend
npm run build --workspace=backend
npm run prisma:deploy --workspace=backend   # applica le migration
npm start --workspace=backend               # serve API + frontend/dist sulla stessa porta
```

Questo è esattamente ciò che esegue Railway ad ogni deploy (vedi build/start
command del servizio `backend` nel progetto Railway `control1`).

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
- `GET/POST /api/habits`, `POST /api/habits/:id/logs`
- `GET /api/stats/muscle-volume?from=&to=` — volume allenante per gruppo muscolare
- `GET /api/stats/nutrition?from=&to=` — medie di kcal/macro/sonno nel periodo
- `GET/POST /api/period-notes`
