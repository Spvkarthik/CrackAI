# CrackAI

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on the Vite dev server (see terminal output for URL).

## Backend (API)

The frontend expects an API at `http://localhost:5000/api`.

```bash
cd backend
npm install
npm run dev
```

### Implemented endpoints

- `POST /api/register` `{ name, email, password }`
- `POST /api/login` `{ email, password }` → `{ token, user }`
- `POST /api/analyze` (multipart form-data, field `image`) + optional `structureName`, `locationTag`
- `GET /api/history`
- `GET /api/results/:id`
- `GET /api/trend?metric=damageScore&structureName=&locationTag=`
- `GET /api/alerts?structureName=&locationTag=`

### Notes

- Data is stored locally in `backend/data/db.json` (easy to upgrade to SQLite later).
- Uploads are saved to `backend/uploads/` and served at `/uploads/...`.