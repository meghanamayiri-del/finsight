import pandas as pd
from sklearn.linear_model import LinearRegression
import os
from fastapi import Body

import joblib
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
import easyocr
import re
from pwdlib import PasswordHash
from jose import jwt
from datetime import datetime, timedelta

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "expense_classifier.pkl"
)

expense_model = joblib.load(MODEL_PATH)
reader = easyocr.Reader(['en'], gpu=False)

app = FastAPI(title="FinSight API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = PasswordHash.recommended()

SECRET_KEY = "finsight-secret-key-change-later"
ALGORITHM = "HS256"


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    income: float
    goal: float
    currency: str = "INR"


class LoginRequest(BaseModel):
    email: str
    password: str


def create_token(user_id: int):
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)



@app.post("/auth/register")
def register(request: RegisterRequest):
    conn = get_db()
    cursor = conn.cursor()

    # Check if email already exists
    cursor.execute(
        "SELECT id FROM users WHERE email = %s;",
        (request.email,)
    )

    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password
    password_hash = pwd_context.hash(request.password)

    # Create user
    cursor.execute("""
        INSERT INTO users (name, email, password_hash)
        VALUES (%s, %s, %s)
        RETURNING id;
    """, (
        request.name,
        request.email,
        password_hash
    ))

    user_id = cursor.fetchone()[0]

    # Create user's profile
    cursor.execute("""
    INSERT INTO user_profile
    (user_id, income, savings_goal, currency)
    VALUES (%s, %s, %s, %s);
""", (
    user_id,
    request.income,
    request.goal,
    request.currency
))

    conn.commit()

    cursor.close()
    conn.close()

    token = create_token(user_id)

    return {
        "message": "Registration successful",
        "token": token,
        "user": {
            "id": user_id,
            "name": request.name,
            "email": request.email,
            "income": request.income,
            "goal": request.goal,
            "currency": request.currency
        }
    }

@app.post("/auth/login")
def login(request: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name, email, password_hash
        FROM users
        WHERE email = %s;
    """, (request.email,))

    user = cursor.fetchone()

    if not user:
        cursor.close()
        conn.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    user_id, name, email, password_hash = user

    if not pwd_context.verify(request.password, password_hash):
        cursor.close()
        conn.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    cursor.close()
    conn.close()

    token = create_token(user_id)

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email
        }
    }

def get_db():
    return psycopg2.connect(
        dbname="finsight",
        user="postgres"
    )

class Transaction(BaseModel):
    merchant: str
    category: str
    subcategory: str | None = None
    date: str
    amount: float
    method: str | None = None
    source: str | None = None
    description: str | None = None


@app.get("/")
def home():
    return {
        "message": "FinSight API is running!"
    }


@app.get("/db-test")
def db_test():
    conn = get_db()
    conn.close()

    return {
        "message": "PostgreSQL connection successful!"
    }



@app.get("/transactions")
def get_transactions():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM transactions WHERE user_id = %s ORDER BY date DESC;",
        (1,)
    )

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    transactions = []

    for row in rows:
        transactions.append({
            "id": row[0],
            "merchant": row[1],
            "category": row[2],
            "subcategory": row[3],
            "date": str(row[4]),
            "amount": float(row[5]),
            "method": row[6],
            "source": row[7],
            "description": row[8]
        })

    return transactions


class TransactionCreate(BaseModel):
    merchant: str
    category: str
    subcategory: str | None = None
    date: str
    amount: float
    method: str
    source: str = "manual"
    description: str = ""





@app.post("/transactions")
def add_transaction(tx: TransactionCreate = Body(...)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO transactions
        (user_id, merchant, category, subcategory, date, amount,
         payment_method, source, description)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
    """, (
        1,
        tx.merchant,
        tx.category,
        tx.subcategory,
        tx.date,
        tx.amount,
        tx.method,
        tx.source,
        tx.description
    ))

    new_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()

    return {
        "message": "Transaction added successfully!",
        "id": new_id
    }


@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM transactions WHERE id = %s AND user_id = %s;",
        (transaction_id, 1)
    )

    deleted = cursor.rowcount
    conn.commit()
    cursor.close()
    conn.close()

    if deleted == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return {"message": "Transaction deleted successfully!"}


@app.put("/transactions/{transaction_id}")
def update_transaction(
    transaction_id: int,
    tx: Transaction
):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE transactions
        SET merchant = %s,
            category = %s,
            subcategory = %s,
            date = %s,
            amount = %s,
            payment_method = %s,
            source = %s,
            description = %s
        WHERE id = %s AND user_id = %s;
    """, (
        tx.merchant,
        tx.category,
        tx.subcategory,
        tx.date,
        tx.amount,
        tx.method,
        tx.source,
        tx.description,
        transaction_id,
        1
    ))

    updated = cursor.rowcount
    conn.commit()
    cursor.close()
    conn.close()

    if updated == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return {"message": "Transaction updated successfully!"}


@app.get("/dashboard/summary")
def dashboard_summary():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COALESCE(SUM(amount), 0)
        FROM transactions
        WHERE user_id = %s;
    """, (1,))
    expenses = float(cursor.fetchone()[0])

    cursor.execute("""
        SELECT income
        FROM user_profile
        WHERE user_id = %s;
    """, (1,))
    result = cursor.fetchone()

    if result is None:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Demo profile not found")

    income = float(result[0])
    savings = income - expenses
    rate = (savings / income) * 100 if income else 0

    cursor.close()
    conn.close()

    return {
        "income": income,
        "expenses": expenses,
        "savings": savings,
        "rate": round(rate, 2)
    }


@app.get("/profile")
def get_profile():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT income, savings_goal
        FROM user_profile
        WHERE user_id = %s;
    """, (1,))

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Demo profile not found")

    return {
        "income": float(row[0]),
        "goal": float(row[1])
    }

class ProfileUpdate(BaseModel):
    income: float
    goal: float



@app.put("/profile")
def update_profile(profile: ProfileUpdate):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE user_profile
        SET income = %s, savings_goal = %s
        WHERE user_id = %s;
    """, (profile.income, profile.goal, 1))

    updated = cursor.rowcount
    conn.commit()
    cursor.close()



class SMSRequest(BaseModel):
    message: str


@app.post("/ml/categorize")
def categorize_sms(request: SMSRequest):
    prediction = expense_model.predict([request.message])[0]

    return {
        "category": prediction
    }

@app.get("/ml/expense-forecast")
def expense_forecast():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            DATE_TRUNC('month', date) AS month,
            SUM(amount) AS amount
        FROM transactions
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY month
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    if len(rows) < 2:
        return {
            "prediction": 0,
            "message": "Not enough transaction history"
        }

    amounts = [float(row[1]) for row in rows]

    # Simple trend-based ML forecast
    X = pd.DataFrame(
        {"month_index": range(1, len(amounts) + 1)}
    )
    y = pd.Series(amounts)

    model = LinearRegression()
    model.fit(X, y)

    next_index = len(amounts) + 1

    prediction = model.predict(
        pd.DataFrame(
            {"month_index": [next_index]}
        )
    )[0]

    prediction = max(0, prediction)

    return {
        "prediction": round(float(prediction), 2),
        "current": round(amounts[-1], 2),
        "average": round(sum(amounts) / len(amounts), 2),
        "months_used": len(amounts)
    }

@app.get("/ml/anomalies")
def detect_anomalies():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, merchant, category, date, amount
        FROM transactions
        ORDER BY date
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    if len(rows) < 3:
        return []

    amounts = [float(row[4]) for row in rows]

    mean = sum(amounts) / len(amounts)

    variance = sum((x - mean) ** 2 for x in amounts) / len(amounts)
    std = variance ** 0.5

    anomalies = []

    for row in rows:
        amount = float(row[4])

        if std > 0 and amount > mean + 2 * std:
            anomalies.append({
                "id": row[0],
                "merchant": row[1],
                "category": row[2],
                "date": str(row[3]),
                "amount": amount,
                "average": round(mean, 2),
                "reason": "This transaction is significantly higher than your usual spending.",
                "severity": "high"
            })

    return anomalies

@app.get("/ml/recurring")
def detect_recurring():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT merchant, COUNT(*) AS count, AVG(amount) AS avg_amount
        FROM transactions
        GROUP BY merchant
        HAVING COUNT(*) >= 2
        ORDER BY count DESC
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {
            "merchant": row[0],
            "count": row[1],
            "average_amount": round(float(row[2]), 2)
        }
        for row in rows
    ]

@app.post("/receipts/scan")
async def scan_receipt(file: UploadFile = File(...)):
    image_bytes = await file.read()

    temp_path = "temp_receipt.jpg"

    with open(temp_path, "wb") as f:
        f.write(image_bytes)

    # OCR
    results = reader.readtext(temp_path)

    # Keep individual OCR lines
    ocr_lines = [text.strip() for _, text, _ in results if text.strip()]
    extracted_text = " ".join(ocr_lines)

    # -------------------------
    # Extract amount
    # -------------------------
    amounts = []

    for line in ocr_lines:
        matches = re.findall(r'(?:₹|Rs\.?|INR)?\s*(\d+(?:[.,]\d{1,2})?)', line, re.IGNORECASE)

        for match in matches:
            try:
                value = float(match.replace(",", ""))

                # Ignore very small numbers such as order numbers / SAC codes
                if value > 20:
                    amounts.append(value)
            except ValueError:
                pass

    # Usually the largest amount on a receipt is the total
    amount = max(amounts) if amounts else 0

    # -------------------------
    # Extract date
    # -------------------------
    date = None

    date_patterns = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
        r'\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}\b',
        r'\b[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4}\b'
    ]

    for line in ocr_lines:
        for pattern in date_patterns:
            match = re.search(pattern, line)

            if match:
                date = match.group(0)
                break

        if date:
            break

    # -------------------------
    # Extract merchant
    # -------------------------
    merchant = ocr_lines[0] if ocr_lines else "Unknown Merchant"

    # -------------------------
    # ML category prediction
    # -------------------------
    category = expense_model.predict([extracted_text])[0]

    # Remove temporary image
    os.remove(temp_path)

    return {
        "text": extracted_text,
        "merchant": merchant,
        "amount": amount,
        "date": date,
        "category": category
    }


@app.get("/dashboard/category-spending")
def get_category_spending():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT category, SUM(amount)
        FROM transactions
        WHERE user_id = %s
        GROUP BY category
        ORDER BY SUM(amount) DESC;
    """, (1,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        {"category": row[0], "amount": float(row[1])}
        for row in rows
    ]


@app.get("/dashboard/monthly-spending")
def get_monthly_spending():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
               SUM(amount)
        FROM transactions
        WHERE user_id = %s
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY DATE_TRUNC('month', date);
    """, (1,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        {"month": row[0], "amount": float(row[1])}
        for row in rows
    ]

@app.get("/dashboard/income-expenses")
def get_income_expenses():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT income
        FROM user_profile
        WHERE user_id = %s;
    """, (1,))
    profile = cursor.fetchone()
    income = float(profile[0]) if profile else 0.0

    cursor.execute("""
        SELECT TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM'),
               SUM(amount)
        FROM transactions
        WHERE user_id = %s
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY DATE_TRUNC('month', date);
    """, (1,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        {
            "month": row[0],
            "income": income,
            "expenses": float(row[1])
        }
        for row in rows
    ]



