
import json
import csv
from pathlib import Path

data_dir = Path("data")
input_file = data_dir / "train.jsonl"
output_file = data_dir / "train.csv"

with input_file.open("r", encoding="utf-8") as infile, \
     output_file.open("w", encoding="utf-8", newline="") as outfile:

    writer = csv.DictWriter(
        outfile,
        fieldnames=["sms_text", "assistant_output", "category"]
    )
    writer.writeheader()

    for line in infile:
        record = json.loads(line)
        messages = record.get("messages", [])

        sms_text = ""
        assistant_output = ""
        category = ""

        for message in messages:
            if message.get("role") == "user":
                sms_text = message.get("content", "")

            elif message.get("role") == "assistant":
                assistant_output = message.get("content", "")

                try:
                    parsed = json.loads(assistant_output)
                    category = parsed.get("category", "")
                except (json.JSONDecodeError, TypeError):
                    pass

        writer.writerow({
            "sms_text": sms_text,
            "assistant_output": assistant_output,
            "category": category
        })

print(f"Conversion complete: {output_file}")
