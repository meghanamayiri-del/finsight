
# FinSight — Smart Expense Tracker & AI Financial Advisor

A full-stack expense tracking application that helps users record expenses, analyze spending patterns, view category-wise breakdowns, forecast future expenses, and receive personalized financial insights.

## 1. Tech Stack

**Frontend**

* React
* Vite
* Tailwind CSS
* Recharts
* Lucide React

**Backend**

* Python
* FastAPI
* PostgreSQL
* Psycopg2

**Machine Learning**

* Expense classification
* Expense forecasting
* Spending analytics and insights

## 2. Project Structure

```text
finsight_2/
├── backend/
│   ├── data/
│   ├── main.py
│   ├── database.py
│   ├── train_model.py
│   ├── evaluate_model.py
│   ├── compare_models.py
│   ├── train_forecasting.py
│   ├── evaluate_forecasting.py
│   ├── expense_classifier.pkl
│   ├── expense_forecasting.pkl
│   └── venv/
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── pages/
│   └── utils/
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## 3. Start the Project

Open two terminal windows in VS Code.

### Terminal 1 — Start the Backend

From the project root:

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

Backend API: http://127.0.0.1:8000

Interactive API documentation: http://127.0.0.1:8000/docs

Keep this terminal running while using the application.

### Terminal 2 — Start the Frontend

Open a second terminal and navigate to the project root:

```bash
cd ~/Desktop/finsight_2
npm run dev
```

Open the local URL printed by Vite in the terminal. It may use port `5173` or another available port.

### If Frontend Dependencies Are Missing

Run this from the project root:

```bash
npm install
```

### If Python Dependencies Are Missing

Activate the backend virtual environment first, then install the packages required by the backend. Use the project's existing imports and setup instructions to determine the exact dependencies.

## 4. PostgreSQL Database

Database name: `finsight`

The database connection is configured in:

```text
backend/database.py
```

Start PostgreSQL before starting the backend. The database must already exist, and the connection settings must match your local PostgreSQL setup.

To inspect the API endpoints, open:

http://127.0.0.1:8000/docs

## 5. Database Backup

**Create a backup before importing historical transactions or changing database records.**

Create a backup on the Desktop:

```bash
pg_dump -U postgres -d finsight -F c -f ~/Desktop/finsight_before_import.dump
```

Check that the backup file exists:

```bash
ls -lh ~/Desktop/finsight_before_import.dump
```

Create another backup with a different filename before future major changes so the earlier backup is preserved.

### Restore a Database Backup — Use Carefully

The following command can replace existing database objects and data. Only use it when you deliberately want to restore the backup, and first make a separate backup of the current database.

```bash
pg_restore -U postgres -d finsight --clean --if-exists ~/Desktop/finsight_before_import.dump
```

Do not run this as part of normal project startup.

## 6. Git and GitHub Commands

Project directory:

```bash
cd ~/Desktop/finsight_2
```

### Check Current Changes

```bash
git status
```

### Save Changes Locally

```bash
git add .
git status
git commit -m "Describe your changes"
```

Always review `git status` before committing.

### Upload Changes to GitHub

```bash
git push
```

The local `main` branch tracks the GitHub `main` branch, so this is sufficient for normal future pushes.

### Download Changes from GitHub

```bash
git pull
```

### View Recent Commits

```bash
git log --oneline -5
```

### Check the Remote Repository

```bash
git remote -v
```

GitHub repository:

https://github.com/meghanamayiri-del/finsight

## 7. Important Git Safety Notes

* Never commit passwords, API keys, access tokens, or private credentials.
* Keep `.env` files out of Git.
* Do not commit `node_modules/` or Python virtual environments.
* The large `backend/data/train.jsonl` training dataset is excluded from Git because it exceeds GitHub's standard per-file size limit.
* Keep a separate copy of important datasets and trained models if you need to reproduce training.
* GitHub code backups do not include your live PostgreSQL database.

## 8. Current Project Status

* Frontend and FastAPI backend are connected.
* PostgreSQL connectivity has been tested.
* Expense transactions can be created, updated, and deleted through the API.
* Dashboard summary values and category spending data are connected to the backend.
* The category chart has been corrected to use the API's category and amount fields.
* The code has been pushed to the private GitHub repository.
* A PostgreSQL backup was created at `~/Desktop/finsight_before_import.dump`.

## 9. Next Planned Work

1. Verify the current transaction count and date range.
2. Prepare historical transactions for March–August 2026.
3. Preserve the existing transactions and database structure.
4. Import the additional records safely.
5. Verify monthly spending charts, category breakdowns, and dashboard totals.
6. Review ML predictions and insights against the expanded dataset.

---

**Reminder:** Start PostgreSQL, start the backend, and start the frontend in separate steps. Back up the database before importing or modifying large amounts of transaction data.
