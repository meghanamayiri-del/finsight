import pandas as pd
from sklearn.linear_model import LinearRegression
import os
from fastapi import Body
import fitz
from PIL import Image
import io
from fastapi import HTTPException
import numpy as np

import joblib
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
import re
from pwdlib import PasswordHash
from jose import jwt
from datetime import datetime, timedelta

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "expense_classifier.pkl"
)

expense_model = joblib.load(MODEL_PATH)
reader = None




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
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        return psycopg2.connect(database_url)

    return psycopg2.connect(
        dbname="finsight",
        user="postgres",
        host="localhost",
        port=5432
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
        "SELECT * FROM transactions ORDER BY date DESC;"
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
    (merchant, category, subcategory, date, amount,
     payment_method, source, description)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id;
""", (
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
    "DELETE FROM transactions WHERE id = %s;",
    (transaction_id,)
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
        WHERE id = %s;
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
        WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
          AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
    """)
    
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
    cursor.close()
    conn.close()

    return {"message": "Profile updated successfully"}



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

    try:
        # Overall spending by month
        cursor.execute("""
            SELECT
                DATE_TRUNC('month', date)::date AS month,
                SUM(amount) AS amount
            FROM transactions
            GROUP BY DATE_TRUNC('month', date)
            ORDER BY month
        """)
        monthly_rows = cursor.fetchall()

        # Spending by month and category
        cursor.execute("""
            SELECT
                DATE_TRUNC('month', date)::date AS month,
                category,
                SUM(amount) AS amount
            FROM transactions
            GROUP BY DATE_TRUNC('month', date), category
            ORDER BY month
        """)
        category_rows = cursor.fetchall()

    finally:
        cursor.close()
        conn.close()

    if len(monthly_rows) < 2:
        return {
            "prediction": 0,
            "forecasts": [],
            "message": "Not enough transaction history"
        }

    # Create a continuous monthly timeline
    first_month = pd.Timestamp(monthly_rows[0][0])
    last_month = pd.Timestamp(monthly_rows[-1][0])

    months = list(pd.date_range(
        start=first_month,
        end=last_month,
        freq="MS"
    ))

    actual_by_month = {
        pd.Timestamp(month).to_period("M"): float(amount)
        for month, amount in monthly_rows
    }

    actual_amounts = [
        actual_by_month.get(month.to_period("M"), 0.0)
        for month in months
    ]

    # Train overall spending forecast
    X = pd.DataFrame({
        "month_index": range(1, len(actual_amounts) + 1)
    })
    y = pd.Series(actual_amounts)

    model = LinearRegression()
    model.fit(X, y)

    future_indices = list(
        range(len(actual_amounts) + 1, len(actual_amounts) + 4)
    )

    overall_predictions = model.predict(
        pd.DataFrame({"month_index": future_indices})
    )

    overall_predictions = [
        round(max(0.0, float(value)), 2)
        for value in overall_predictions
    ]

    # Collect category spending for each month
    category_monthly = {}

    for month, category, amount in category_rows:
        if not category:
            continue

        category_name = str(category)
        month_key = pd.Timestamp(month).to_period("M")

        category_monthly.setdefault(category_name, {})
        category_monthly[category_name][month_key] = float(amount)

    # Predict each category for the next three months
    future_months = [
        months[-1] + pd.DateOffset(months=i)
        for i in range(1, 4)
    ]

    forecasts = []

    for i, future_month in enumerate(future_months):
        category_predictions = {}

        for category_name, monthly_values in category_monthly.items():
            values = [
                monthly_values.get(month.to_period("M"), 0.0)
                for month in months
            ]

            # Use historical average when there is too little
            # non-zero history to fit a useful trend.
            if sum(value > 0 for value in values) < 2:
                predicted_value = (
                    sum(values) / len(values) if values else 0.0
                )
            else:
                category_model = LinearRegression()
                category_X = pd.DataFrame({
                    "month_index": range(1, len(values) + 1)
                })
                category_model.fit(category_X, pd.Series(values))

                predicted_value = category_model.predict(
                pd.DataFrame({
                    "month_index": [len(values) + i + 1]
                })
            )[0]

            # Prevent a decreasing trend from producing zero forecasts
            if predicted_value <= 0:
                non_zero_values = [value for value in values if value > 0]
                predicted_value = (
                    sum(non_zero_values) / len(non_zero_values)
                    if non_zero_values
                    else 0.0
                )

            category_predictions[category_name] = round(
                max(0.0, float(predicted_value)), 2
            )

        forecasts.append({
            "month": future_month.strftime("%Y-%m"),
            "prediction": overall_predictions[i],
            "categories": category_predictions
        })

    return {
        # Keep these fields for the existing frontend
        "prediction": overall_predictions[0],
        "current": round(actual_amounts[-1], 2),
        "average": round(
            sum(actual_amounts) / len(actual_amounts), 2
        ),
        "months_used": len(actual_amounts),

        # New three-month forecast data
        "forecasts": forecasts
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

# Handle PDF receipts and image uploads
    if file.content_type == "application/pdf" or file.filename.lower().endswith(".pdf"):
        # Open PDF from uploaded bytes
        pdf_document = fitz.open(stream=image_bytes, filetype="pdf")

        if len(pdf_document) == 0:
            raise HTTPException(status_code=400, detail="The PDF is empty.")

        # Convert the first PDF page into an image
        page = pdf_document.load_page(0)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)

        image = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        pdf_document.close()

        # Run OCR on the converted image
        # Run OCR on the converted image
        results = get_ocr_reader().readtext(np.array(image))

    else:
            # Handle regular image uploads
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        results = get_ocr_reader().readtext(np.array(image))

    # Keep individual OCR lines
    ocr_lines = [text.strip() for _, text, _ in results if text.strip()]
    extracted_text = " ".join(ocr_lines)

    # -------------------------
    # Extract amount
    # -------------------------
        # Extract amount, prioritizing the final amount paid
    # Extract amount, prioritizing the final amount paid
    # Extract amount, prioritizing the final amount paid
    amount = 0

    priority_patterns = [
        r'\btotal\s+paid\b\s*(?:inr|rs\.?|₹)?\s*([\d,]+(?:\.\d{1,2})?)',
        r'\bamount\s+paid\b\s*(?:inr|rs\.?|₹)?\s*([\d,]+(?:\.\d{1,2})?)',
        r'\bgrand\s+total\b\s*(?:inr|rs\.?|₹)?\s*([\d,]+(?:\.\d{1,2})?)',
        r'\bamount\s+payable\b\s*(?:inr|rs\.?|₹)?\s*([\d,]+(?:\.\d{1,2})?)',
        r'\bfinal\s+total\b\s*(?:inr|rs\.?|₹)?\s*([\d,]+(?:\.\d{1,2})?)',
        r'(?<!sub)\btotal\b\s*(?:inr|rs\.?|₹)?\s*([\d,]+(?:\.\d{1,2})?)',
    ]

    for pattern in priority_patterns:
        match = re.search(pattern, extracted_text, re.IGNORECASE)

        if match:
            try:
                amount = float(match.group(1).replace(",", ""))
                break
            except ValueError:
                pass

    # Fallback: use subtotal only if no final total is found
    if amount == 0:
        match = re.search(
            r'\bsubtotal\b\s*(?:inr|rs\.?|₹)?\s*([\d,]+(?:\.\d{1,2})?)',
            extracted_text,
            re.IGNORECASE
        )

        if match:
            amount = float(match.group(1).replace(",", ""))

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

  
    # Extract merchant
    merchant = "Unknown Merchant"

    ignored_words = [
        "phonepe",
        "google pay",
        "gpay",
        "paytm",
        "payment successful",
        "transaction successful",
        "receipt",
        "invoice",
        "paid successfully",
        "order details"
    ]

    for line in ocr_lines[:8]:
        cleaned_line = line.strip()
        lower_line = cleaned_line.lower()

        # Skip empty lines and common payment app or receipt headings
        if not cleaned_line:
            continue

        if any(word in lower_line for word in ignored_words):
            continue

        # Skip lines that mostly contain numbers
        if sum(char.isdigit() for char in cleaned_line) > len(cleaned_line) / 2:
            continue

        merchant = cleaned_line
        break
    # Construct a transaction-style message
    transaction_message = (
        f"Payment to {merchant}. "
        f"Amount INR {amount}. "
        f"Transaction details: {extracted_text}"
    )
    # -------------------------
    # ML category prediction
    # -------------------------
    category = expense_model.predict([transaction_message])[0]
   
# Predict category using the trained ML model
    category = expense_model.predict([transaction_message])[0]

    receipt_text_lower = extracted_text.lower()

    # Use a category only when the receipt gives a clear indication.
    # Otherwise, classify the purchase as shopping.
    receipt_category_keywords = {
        "food": ["restaurant", "food order", "swiggy", "zomato"],
        "grocery": ["supermarket", "grocery store", "groceries"],
        "transport": ["fuel station", "petrol pump", "uber", "ola"],
        "travel": ["flight ticket", "hotel booking", "travel booking"],
        "bills": ["electricity bill", "water bill", "internet bill"],
        "entertainment": ["movie ticket", "cinema", "concert"],
        "healthcare": ["pharmacy", "medical store", "hospital"],
    }

    matched_category = next(
        (
            candidate
            for candidate, keywords in receipt_category_keywords.items()
            if any(keyword in receipt_text_lower for keyword in keywords)
        ),
        None
    )

    if matched_category:
        category = matched_category
    elif category in ("investment", "transfer", "cashback", "refund", "emi"):
        category = "shopping"

    #os.remove(temp_path)

    return {
        "text": extracted_text,
        "transaction_message": transaction_message,
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
        GROUP BY category
        ORDER BY SUM(amount) DESC;
    """)

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
        
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY DATE_TRUNC('month', date);
    """)

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
        
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY DATE_TRUNC('month', date);
    """)

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


@app.get("/debug/health-spending")
def debug_health_spending():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            DATE_TRUNC('month', date)::date AS month,
            category,
            SUM(amount) AS amount
        FROM transactions
        WHERE LOWER(category) LIKE '%health%'
        GROUP BY DATE_TRUNC('month', date), category
        ORDER BY month
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        {
            "month": str(row[0]),
            "category": row[1],
            "amount": float(row[2])
        }
        for row in rows
    ]


@app.get("/ml/expense-forecast-test")
def expense_forecast_test():
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                DATE_TRUNC('month', date)::date AS month,
                SUM(amount) AS amount
            FROM transactions
            GROUP BY DATE_TRUNC('month', date)
            ORDER BY month
        """)
        rows = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    if len(rows) < 4:
        return {"message": "Not enough monthly history to test"}

    amounts = [float(row[1]) for row in rows]

    # Train on every month except the last one.
    train = amounts[:-1]
    actual = amounts[-1]

    X_train = pd.DataFrame({
        "month_index": range(1, len(train) + 1)
    })
    y_train = pd.Series(train)

    model = LinearRegression()
    model.fit(X_train, y_train)

    predicted = float(model.predict(
        pd.DataFrame({"month_index": [len(train) + 1]})
    )[0])

    predicted = max(0.0, predicted)
    error = abs(actual - predicted)

    return {
        "tested_month": rows[-1][0].strftime("%Y-%m"),
        "months_used_for_training": len(train),
        "actual_spending": round(actual, 2),
        "predicted_spending": round(predicted, 2),
        "absolute_error": round(error, 2),
        "absolute_percentage_error": round(
            error / actual * 100, 2
        ) if actual else None
    }

