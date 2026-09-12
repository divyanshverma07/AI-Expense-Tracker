from app.services.ocr_service import process_receipt


image_path = "zudio_bill.jpeg"

result = process_receipt(image_path)

print("\n========== OCR + NLP RESULT ==========\n")

print("Merchant:")
print(result["merchant"])

print("\nAmount:")
print(result["amount"])

print("\nDate:")
print(result["date"])

print("\nDescription:")
print(result["description"])

print("\nPredicted Category:")
print(result["predicted_category"])

print("\nExtracted Text:")
print(result["text"])