import csv
import random
from datetime import date
from pathlib import Path
import calendar

random.seed(42)

# Each entry: category, subcategory, merchants, minimum, maximum
expenses = [
    ("Bills & Utilities", "Electricity",
     ["Electricity Board"], 500, 2500),
    ("Bills & Utilities", "Internet",
     ["ACT Fibernet", "Airtel Broadband"], 500, 1200),
    ("Bills & Utilities", "Mobile",
     ["Jio", "Airtel"], 200, 1000),
    ("Bills & Utilities", "Water",
     ["Water Board"], 150, 600),

    ("Education", "Books",
     ["Bookstore", "Amazon Books"], 200, 1800),

    ("Entertainment", "Games",
     ["Steam", "Gaming Store"], 150, 1500),
    ("Entertainment", "Movies",
     ["PVR Cinemas", "INOX"], 200, 1000),
    ("Entertainment", "Streaming",
     ["Netflix", "Spotify"], 149, 800),

    ("Food", "Cafe",
     ["Cafe Coffee Day", "Local Cafe"], 100, 600),
    ("Food", "Groceries",
     ["DMart", "Local Grocery Store"], 300, 2500),
    ("Food", "Junk Food",
     ["McDonald's", "Domino's"], 100, 700),
    ("Food", "Restaurants",
     ["Restaurant", "Food Court"], 250, 1800),

    ("Health", "Doctor/Hospital",
     ["Clinic", "Hospital"], 300, 3000),
    ("Health", "Fitness",
     ["Gym"], 500, 2000),
    ("Health", "Medicine",
     ["Medical Store"], 100, 1200),

    ("Other", "Gifts",
     ["Gift Shop"], 300, 2500),
    ("Other", "Personal Care",
     ["Personal Care Store"], 100, 1000),

    ("Shopping", "Clothing",
     ["Clothing Store", "Myntra"], 400, 3000),
    ("Shopping", "Electronics",
     ["Electronics Store"], 500, 6000),
    ("Shopping", "Online Shopping",
     ["Amazon", "Flipkart"], 200, 3500),

    ("Travel & Transport", "Bus/Train",
     ["TSRTC", "Indian Railways"], 30, 1000),
    ("Travel & Transport", "Cab",
     ["Uber", "Ola"], 80, 700),
    ("Travel & Transport", "Fuel",
     ["Petrol Pump"], 300, 2000),
]

payment_methods = [
    "UPI", "Debit Card", "Credit Card", "Net Banking", "Cash"
]

rows = []

for month in range(3, 9):  # March through August 2026
    days_in_month = calendar.monthrange(2026, month)[1]

    for _ in range(12):
        category, subcategory, merchants, low, high = random.choice(expenses)
        transaction_date = date(
            2026, month, random.randint(1, days_in_month)
        )

        merchant = random.choice(merchants)
        amount = round(random.uniform(low, high), 2)
        method = random.choice(payment_methods)
        source = random.choices(
            ["Manual", "Receipt"], weights=[80, 20]
        )[0]

        description = f"{subcategory} expense at {merchant}"

        rows.append({
            "merchant": merchant,
            "category": category,
            "subcategory": subcategory,
            "date": transaction_date.isoformat(),
            "amount": f"{amount:.2f}",
            "payment_method": method,
            "source": source,
            "description": description,
        })

rows.sort(key=lambda row: row["date"])

output = Path(__file__).parent / "historical_transactions_mar_aug_2026.csv"

with output.open("w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=[
        "merchant", "category", "subcategory", "date", "amount",
        "payment_method", "source", "description"
    ])
    writer.writeheader()
    writer.writerows(rows)

print(f"CSV created: {output}")
print(f"Total transactions: {len(rows)}")
print("Date range: 2026-03-01 to 2026-08-31")
print("These are synthetic demo transactions.")
