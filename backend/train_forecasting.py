import os
import pandas as pd
import joblib

from sklearn.linear_model import LinearRegression


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "personal_finance.csv")
MODEL_PATH = os.path.join(BASE_DIR, "expense_forecasting.pkl")


df = pd.read_csv(DATA_PATH)

df["Date"] = pd.to_datetime(df["Date"])

# Keep only expenses
expenses = df[df["TransactionType"].str.lower() == "debit"].copy()

# Create monthly expense totals
monthly = (
    expenses
    .groupby(expenses["Date"].dt.to_period("M"))["Amount"]
    .sum()
    .reset_index()
)

monthly["month_index"] = range(1, len(monthly) + 1)

X = monthly[["month_index"]]
y = monthly["Amount"]

model = LinearRegression()
model.fit(X, y)

next_month_index = len(monthly) + 1
prediction=model.predict(pd.DataFrame([[next_month_index]], columns=["month_index"]))

joblib.dump(model, MODEL_PATH)

print("Monthly records:", len(monthly))
print("Training examples:", len(expenses))
print(f"Predicted next-month expense: ₹{prediction:,.2f}")
print(f"Model saved to: {MODEL_PATH}")