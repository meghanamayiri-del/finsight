import json
import os
import joblib

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "test.jsonl")
MODEL_PATH = os.path.join(BASE_DIR, "expense_classifier.pkl")


def load_data(path):
    texts, labels = [], []

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


X_test, y_test = load_data(DATA_PATH)
model = joblib.load(MODEL_PATH)

print("Test examples:", len(X_test))

if not X_test:
    raise ValueError("No usable test examples found.")

y_pred = model.predict(X_test)

print(f"\nAccuracy:  {accuracy_score(y_test, y_pred) * 100:.2f}%")
print(f"Precision: {precision_score(y_test, y_pred, average='weighted', zero_division=0) * 100:.2f}%")
print(f"Recall:    {recall_score(y_test, y_pred, average='weighted', zero_division=0) * 100:.2f}%")
print(f"F1-score:  {f1_score(y_test, y_pred, average='weighted', zero_division=0) * 100:.2f}%")

print("\nClassification report:")
print(classification_report(y_test, y_pred, zero_division=0))

labels_order = sorted(set(y_test) | set(y_pred))
print("\nConfusion matrix labels:", labels_order)
print(confusion_matrix(y_test, y_pred, labels=labels_order))