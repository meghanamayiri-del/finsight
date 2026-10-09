import os
import pandas as pd

from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "personal_finance.csv")


# -----------------------------
# 1. Load dataset
# -----------------------------

df = pd.read_csv(DATA_PATH)

df["Date"] = pd.to_datetime(df["Date"])


# -----------------------------
# 2. Keep only expenses
# -----------------------------

expenses = df[
    df["TransactionType"].str.lower() == "debit"
].copy()


# -----------------------------
# 3. Create monthly totals
# -----------------------------

monthly = (
    expenses
    .groupby(expenses["Date"].dt.to_period("M"))["Amount"]
    .sum()
    .reset_index()
)

monthly["month_index"] = range(1, len(monthly) + 1)


print("Monthly records:", len(monthly))
print("Expense transactions:", len(expenses))


# -----------------------------
# 4. Chronological train/test split
# -----------------------------

# Use first 80% of months for training
# and final 20% for testing.

split_index = int(len(monthly) * 0.8)

train = monthly.iloc[:split_index]
test = monthly.iloc[split_index:]


X_train = train[["month_index"]]
y_train = train["Amount"]

X_test = test[["month_index"]]
y_test = test["Amount"]


print("\nTraining months:", len(train))
print("Testing months:", len(test))


# -----------------------------
# 5. Train Linear Regression
# -----------------------------

model = LinearRegression()

model.fit(X_train, y_train)


# -----------------------------
# 6. Predict test months
# -----------------------------

y_pred = model.predict(X_test)


# -----------------------------
# 7. Evaluation metrics
# -----------------------------

mae = mean_absolute_error(y_test, y_pred)

rmse = mean_squared_error(
    y_test,
    y_pred
) ** 0.5

r2 = r2_score(y_test, y_pred)


print("\n==============================")
print("FORECASTING MODEL EVALUATION")
print("==============================")

print(f"MAE  : ₹{mae:,.2f}")
print(f"RMSE : ₹{rmse:,.2f}")
print(f"R²   : {r2:.4f}")


# -----------------------------
# 8. Show actual vs predicted
# -----------------------------

print("\n==============================")
print("ACTUAL vs PREDICTED")
print("==============================")

results = test[["Date", "Amount"]].copy()

results["Predicted"] = y_pred

results["Error"] = (
    results["Amount"] - results["Predicted"]
)

print(results.to_string(index=False))