import psycopg2

conn = psycopg2.connect(
    dbname="finsight",
    user="postgres"
)

cursor = conn.cursor()

cursor.execute("""
DROP TABLE IF EXISTS transactions;

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    merchant VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(30),
    source VARCHAR(30),
    description TEXT
);
""")

transactions = [
    ('DMart', 'Food', 'Groceries', '2026-10-07', 2450, 'UPI', 'Receipt', 'Weekly groceries'),
    ('Uber', 'Travel & Transport', 'Cab', '2026-10-06', 320, 'UPI', 'Manual', 'Ride to office'),
    ('Netflix', 'Entertainment', 'Streaming', '2026-10-05', 649, 'Credit Card', 'Manual', 'Monthly subscription'),
    ('Myntra', 'Shopping', 'Clothing', '2026-10-04', 1899, 'Credit Card', 'Manual', 'Festive kurta'),
    ('Apollo Pharmacy', 'Health', 'Medicine', '2026-10-03', 850, 'UPI', 'Receipt', 'Monthly medicines'),
    ('Reliance Digital', 'Shopping', 'Electronics', '2026-10-04', 4800, 'Credit Card', 'Receipt', 'Bluetooth speaker'),
    ('Swiggy', 'Food', 'Junk Food', '2026-10-06', 1380, 'UPI', 'Manual', 'Dinner orders'),
    ('Zomato', 'Food', 'Junk Food', '2026-10-04', 1520, 'UPI', 'Manual', 'Weekend food orders'),
    ("Domino's", 'Food', 'Junk Food', '2026-10-03', 1300, 'Debit Card', 'Manual', 'Pizza night'),
    ('Cafe Coffee Day', 'Food', 'Cafe', '2026-10-05', 550, 'UPI', 'Manual', 'Coffee with friends'),
    ('Ola', 'Travel & Transport', 'Cab', '2026-10-05', 410, 'UPI', 'Manual', 'Airport drop'),
    ('IRCTC', 'Travel & Transport', 'Bus/Train', '2026-10-02', 1850, 'Net Banking', 'Manual', 'Train tickets home'),
    ('Indian Oil', 'Travel & Transport', 'Fuel', '2026-10-01', 1720, 'Debit Card', 'Receipt', 'Petrol'),
    ('Electricity Bill', 'Bills & Utilities', 'Electricity', '2026-10-02', 1850, 'Net Banking', 'Manual', 'TSSPDCL bill'),
    ('Airtel Broadband', 'Bills & Utilities', 'Internet', '2026-10-01', 1199, 'UPI', 'Manual', 'Wi-Fi plan'),
    ('Jio Recharge', 'Bills & Utilities', 'Mobile', '2026-10-03', 749, 'UPI', 'Manual', 'Mobile plan'),
    ('HMWSSB Water Bill', 'Bills & Utilities', 'Water', '2026-10-02', 1202, 'Net Banking', 'Manual', 'Water bill'),
    ('Spotify', 'Entertainment', 'Streaming', '2026-10-05', 119, 'Credit Card', 'Manual', 'Music subscription'),
    ('Amazon Prime', 'Entertainment', 'Streaming', '2026-10-01', 299, 'Credit Card', 'Manual', 'Prime membership'),
    ('BookMyShow', 'Entertainment', 'Movies', '2026-10-04', 1100, 'UPI', 'Manual', 'Movie tickets'),
    ('Steam', 'Entertainment', 'Games', '2026-10-02', 333, 'Credit Card', 'Manual', 'Game purchase'),
    ('Cult.fit', 'Health', 'Fitness', '2026-10-01', 832, 'UPI', 'Manual', 'Gym membership'),
    ("Dr. Reddy's Clinic", 'Health', 'Doctor/Hospital', '2026-10-02', 668, 'Cash', 'Manual', 'Consultation'),
    ('College Books', 'Education', 'Books', '2026-10-02', 1500, 'UPI', 'Receipt', 'Semester textbooks'),
    ('Ferns N Petals', 'Other', 'Gifts', '2026-10-04', 1401, 'Credit Card', 'Manual', 'Birthday gift'),
    ('Urban Company', 'Other', 'Personal Care', '2026-10-05', 1500, 'UPI', 'Manual', 'Salon at home'),
    ('BigBasket', 'Food', 'Groceries', '2026-09-28', 2150, 'UPI', 'Receipt', 'Monthly staples'),
    ('Amazon', 'Shopping', 'Online Shopping', '2026-09-25', 2399, 'Credit Card', 'Manual', 'Kitchen items'),
    ('Swiggy', 'Food', 'Junk Food', '2026-09-22', 640, 'UPI', 'Manual', 'Lunch order'),
    ('Ola', 'Travel & Transport', 'Cab', '2026-09-20', 380, 'UPI', 'Manual', 'Cab ride'),
    ('Zomato', 'Food', 'Restaurants', '2026-09-18', 920, 'UPI', 'Manual', 'Dinner')
]

cursor.executemany("""
    INSERT INTO transactions
    (merchant, category, subcategory, date, amount, payment_method, source, description)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
""", transactions)

conn.commit()

print("Transactions table created successfully!")

cursor.close()
conn.close()