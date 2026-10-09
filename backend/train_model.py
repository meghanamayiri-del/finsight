import json
import os
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "train.jsonl")
MODEL_PATH = os.path.join(BASE_DIR, "expense_classifier.pkl")


texts = []
labels = []


with open(DATA_PATH, "r", encoding="utf-8") as file:
    for line in file:
        record = json.loads(line)

        messages = record.get("messages", [])

        user_message = ""
        assistant_message = ""

        for message in messages:
            if message["role"] == "user":
                user_message = message["content"]

            elif message["role"] == "assistant":
                assistant_message = message["content"]

        if not user_message or not assistant_message:
            continue

        try:
            output = json.loads(assistant_message)
        except json.JSONDecodeError:
            continue

        category = output.get("category")

        if category:
            texts.append(user_message)
            labels.append(category)


print(f"Training examples: {len(texts)}")
print(f"Categories: {sorted(set(labels))}")


model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            max_features=10000
        )
    ),
    (
        "classifier",
        LogisticRegression(
            max_iter=1000
        )
    )
])


model.fit(texts, labels)

joblib.dump(model, MODEL_PATH)

print(f"\nModel saved to: {MODEL_PATH}")