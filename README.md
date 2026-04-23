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

## ML Service (Flask)

For your demo, the Node backend calls a local Flask ML service for crack detection.

### Setup

```bash
cd ml_service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `ROBOFLOW_API_KEY` in your shell (don’t hardcode it):

```bash
export ROBOFLOW_API_KEY="YOUR_KEY"
```

Optional overrides:
- `ROBOFLOW_WORKSPACE` (default `qr-code-detection`)
- `ROBOFLOW_WORKFLOW_ID` (default `general-segmentation-api-4`)
- `ROBOFLOW_CLASSES` (default `crack`)
- `ML_PORT` (default `5050`)

Run the ML service:

```bash
python app.py
```

The Node backend will call it at `http://localhost:5050/detect`.

### Roboflow integration (Hosted API)

By default the backend returns **mock** crack analysis for `POST /api/analyze`.
To use a Roboflow model instead, configure environment variables and enable Roboflow mode.

- **1) Create / deploy a model on Roboflow**
  - Train (or upload) your model in Roboflow.
  - Note the hosted endpoint format: `https://detect.roboflow.com/<project>/<version>`
  - Generate an API key in your Roboflow workspace.

- **2) Add env vars**
  - Copy the example env file:

```bash
cd backend
cp .env.example .env
```

  - Edit `backend/.env` and set:
    - `USE_ROBOFLOW=true`
    - `ROBOFLOW_API_KEY=...`
    - `ROBOFLOW_PROJECT=...`
    - `ROBOFLOW_VERSION=...`

- **3) Start the backend with env loaded**

If you use `direnv`, your shell can auto-load `.env`. Otherwise, a simple way is:

```bash
cd backend
set -a && source .env && set +a
npm run dev
```

- **4) Test it**

After logging in and getting a JWT, call:

```bash
curl -sS -X POST "http://localhost:5000/api/analyze" \
  -H "Authorization: Bearer <YOUR_JWT>" \
  -F "image=@/absolute/path/to/image.jpg" \
  -F "structureName=Demo" \
  -F "locationTag=Wall"
```

Notes:
- If `USE_ROBOFLOW=true` but Roboflow is misconfigured / unreachable, the backend **falls back to mock** analysis so the app still works while you iterate.
- The UI overlay uses `overlayBoxes` returned by the backend; Roboflow boxes are converted into percent-based coordinates for display.

### Alternative: Hugging Face Inference API (quota-friendly)

If Roboflow quota is exhausted, you can point the backend at **Hugging Face’s hosted inference**.

- **1) Pick a model**
  - Find a crack / surface-defect detection model on the Hub (any image model that returns `{label, score}`-style JSON can work).
  - Note its model id like `username/model-name`.

- **2) Add env vars**

In `backend/.env`:
- `ANALYZER_PROVIDER=huggingface`
- `HF_API_KEY=...` (create at Hugging Face settings → access tokens)
- `HF_MODEL_ID=username/model-name`

- **3) Run + test**

Start backend with env loaded, then call the normal analyze endpoint. If HF errors out, backend will **fall back to mock**.

### Workflow-based crack severity (Low/Medium/High)

This repo is currently wired to use a **Roboflow Workflow** (serverless) for segmentation-style crack detection, then computes severity as **Low / Medium / High** from the predicted polygons.

- **Configure**
  - Copy env template:

```bash
cd backend
cp .env.example .env
```

  - Set in `backend/.env`:
    - `ROBOFLOW_API_KEY=...`
    - `ROBOFLOW_WORKSPACE=...`
    - `ROBOFLOW_WORKFLOW_ID=...`
    - `ROBOFLOW_CLASSES=crack`

- **How severity is computed**
  - Each predicted polygon area is measured.
  - We sum total polygon area and count polygons:
    - Low: `total_area < 300` and `crack_count <= 2`
    - Medium: `total_area < 1200`
    - High: otherwise

Notes:
- Do **not** hardcode API keys in code. If you pasted a key in chat, rotate it in Roboflow settings.

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