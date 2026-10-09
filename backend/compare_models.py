
import json
import os

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score, f1_score, classification_report


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")


def load_data(filename):
    texts, labels = [], []
    path = os.path.join(DATA_DIR, filename)

    with open(path, "r", encoding="utf-8") as file:
        for line in file:
            try:
                record = json.loads(line)
                messages = record.get("messages", [])

                user_text = ""
                assistant_text = ""

                for message in messages:
                    if message.get("role") == "user":
                        user_text = message.get("content", "")
                    elif message.get("role") == "assistant":
                        assistant_text = message.get("content", "")

                if not user_text or not assistant_text:
                    continue

                output = json.loads(assistant_text)
                category = output.get("category")

                if category:
                    texts.append(user_text)
                    labels.append(category)

            except (json.JSONDecodeError, TypeError, AttributeError):
                continue

    return texts, labels


X_train, y_train = load_data("train.jsonl")
X_valid, y_valid = load_data("valid.jsonl")

print("Training rows:", len(X_train))
print("Validation rows:", len(X_valid))

if not X_train or not X_valid:
    raise ValueError(
        "No usable examples found. Check JSONL paths and data format."
    )

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Naive Bayes": MultinomialNB(),
    "Linear SVM": LinearSVC(),
}

results = []

for name, classifier in models.items():
    model = Pipeline([
        ("tfidf", TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            max_features=10000
        )),
        ("classifier", classifier),
    ])

    model.fit(X_train, y_train)
    predictions = model.predict(X_valid)

    accuracy = accuracy_score(y_valid, predictions)
    macro_f1 = f1_score(
        y_valid, predictions, average="macro", zero_division=0
    )

    results.append((name, accuracy, macro_f1))

    print(f"\n--- {name} ---")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Macro F1: {macro_f1:.4f}")
    print(classification_report(
        y_valid, predictions, zero_division=0
    ))

print("\n=== MODEL COMPARISON ===")
for name, accuracy, macro_f1 in sorted(
    results, key=lambda row: row[2], reverse=True
):
    print(
        f"{name}: Accuracy={accuracy:.4f}, "
        f"Macro F1={macro_f1:.4f}"
    )

print("\nBest validation model:", max(results, key=lambda row: row[2])[0])