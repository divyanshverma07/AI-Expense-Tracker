import os
import tempfile
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from ..auth import get_current_user
from ..services.ocr_service import process_receipt


router = APIRouter(
    prefix="/expenses",
    tags=["Receipt OCR"]
)

MAX_RECEIPT_SIZE = 5 * 1024 * 1024  # 5 MB

ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp"
}


def parse_receipt_date(value):
    if not value:
        return None

    formats = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y/%m/%d",
        "%Y-%m-%d"
    ]

    for fmt in formats:
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue

    return None


@router.post("/scan-receipt")
async def scan_receipt(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    # 1. Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP receipt images are allowed."
        )

    # 2. Read file
    file_data = await file.read()

    # 3. Validate file size
    if len(file_data) > MAX_RECEIPT_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Receipt image must be smaller than 5 MB."
        )

    temp_path = None

    try:
        # 4. Create temporary file
        suffix = os.path.splitext(file.filename or ".jpg")[1]

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_file.write(file_data)
            temp_path = temp_file.name

        # 5. OCR + NLP processing
        result = process_receipt(temp_path)

        # 6. Convert OCR date
        parsed_date = parse_receipt_date(result.get("date"))

        # 7. Return only required preview data
        return {
            "merchant": result.get("merchant"),
            "amount": (
                Decimal(str(result["amount"]))
                if result.get("amount") is not None
                else None
            ),
            "date": parsed_date,
            "description": result.get("description"),
            "predicted_category": result.get("predicted_category")
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Receipt processing failed: {str(e)}"
        )

    finally:
        # 8. Delete temporary image
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)