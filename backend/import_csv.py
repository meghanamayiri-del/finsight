import pandas as pd
import psycopg2

CSV_PATH = "data/personal_finance.csv"

# Read CSV
df = pd.read_csv(CSV_PATH)

# Convert dates
df["Date"] = pd.to_datetime(df["Date"])

# Keep May–October 2025
df = df[
    (df["Date"] >= "2025-05-01") &
    (df["Date"] < "2025-11-01")
].copy()

# Map categories
category_map = {
    "Food": "Food",
    "Grocery": "Food",
    "Bills": "Bills & Utilities",
    "Travel": "Travel & Transport",
    "Transport": "Travel & Transport",
    "Healthcare": "Health",
    "Entertainment": "Entertainment",
    "Online Shopping": "Shopping",
    "Clothing": "Shopping",
    "Electronics": "Shopping",
}

df["FinSightCategory"] = df["Category"].map(category_map)

# Shift 2025 → 2026
df["Date"] = df["Date"] + pd.DateOffset(years=1)

# Prepare fields
df["merchant"] = (
    df["Description"]
    .str.replace("Transaction at ", "", regex=False)
    .str.strip()
)

df["subcategory"] = df["Category"]
df["payment_method"] = df["PaymentMethod"]
df["source"] = "Dataset"
df["description"] = df["Description"]

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="finsight",
    user="postgres"
)

cursor = conn.cursor()

try:
    for _, row in df.iterrows():

        cursor.execute("""
            INSERT INTO transactions
            (merchant, category, subcategory, date, amount,
             payment_method, source, description)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
        """, (
            row["merchant"],
            row["FinSightCategory"],
            row["subcategory"],
            row["Date"].date(),
            float(row["Amount"]),
            row["payment_method"],
            row["source"],
            row["description"]
        ))

    # Commit ONLY after every row succeeds
    conn.commit()

    print(f"Successfully inserted {len(df)} transactions.")

except Exception as e:
    # Undo everything if something fails
    conn.rollback()
    print("Import failed. No transactions were added.")
    print("Error:", e)

finally:
    cursor.close()
    conn.close()