import os
import re

import cv2
import pytesseract
from .expense_classifier import predict_expense_category

# ==========================================
# TESSERACT CONFIGURATION
# ==========================================

TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


# ==========================================
# IMAGE PREPROCESSING
# ==========================================

def preprocess_receipt(image_path: str):

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Unable to read receipt image")

    # Convert to grayscale
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # Upscale the image
    gray = cv2.resize(
        gray,
        None,
        fx=3,
        fy=3,
        interpolation=cv2.INTER_CUBIC
    )

    # Improve contrast
    gray = cv2.normalize(
        gray,
        None,
        0,
        255,
        cv2.NORM_MINMAX
    )

    # OTSU threshold
    threshold = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    return gray, threshold


# ==========================================
# OCR TEXT EXTRACTION
# ==========================================

def extract_text_from_receipt(
    image_path: str
) -> str:

    gray, threshold = preprocess_receipt(
        image_path
    )

    # Use threshold OCR as the primary result.
    # It gives better results for this receipt.
    text = pytesseract.image_to_string(
        threshold,
        config="--psm 6"
    )

    # If OCR returned very little text,
    # fallback to grayscale.
    if len(text.strip()) < 50:

        text = pytesseract.image_to_string(
            gray,
            config="--psm 6"
        )

    return text.strip()


# ==========================================
# AMOUNT EXTRACTION
# ==========================================

def extract_amount(text: str):

    # Normalize OCR text
    normalized = re.sub(
        r'\s+',
        ' ',
        text
    )

    # Highest priority:
    # Total Invoice Amount
    patterns = [
        r'total\s+invoice\s+amount\s*[:\-]?\s*'
        r'(?:₹|rs\.?|inr)?\s*'
        r'([\d,]+(?:\.\d{1,2})?)',

        r'grand\s+total\s*[:\-]?\s*'
        r'(?:₹|rs\.?|inr)?\s*'
        r'([\d,]+(?:\.\d{1,2})?)',

        r'gross\s+total\s*[:\-]?\s*'
        r'(?:₹|rs\.?|inr)?\s*'
        r'([\d,]+(?:\.\d{1,2})?)',

        r'total\s*[:\-]?\s*'
        r'(?:₹|rs\.?|inr)?\s*'
        r'([\d,]+(?:\.\d{1,2})?)'
    ]

    for pattern in patterns:

        matches = re.findall(
            pattern,
            normalized,
            flags=re.IGNORECASE
        )

        if matches:

            try:
                return float(
                    matches[-1].replace(",", "")
                )

            except ValueError:
                continue

    return None


# ==========================================
# DATE EXTRACTION
# ==========================================

def extract_date(text: str):

    # First look specifically around the invoice number.
    invoice_pattern = (
        r'invoice\s*no\.?\s*[:\-]?\s*'
        r'.{0,80}?'
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{4})'
    )

    match = re.search(
        invoice_pattern,
        text,
        flags=re.IGNORECASE
    )

    if match:
        return match.group(1)

    # General fallback
    patterns = [
        r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b',
        r'\b(\d{4}[/-]\d{1,2}[/-]\d{1,2})\b'
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text
        )

        if match:
            return match.group(1)

    return None


# ==========================================
# MERCHANT EXTRACTION
# ==========================================

def extract_merchant(text: str):

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    # OCR can misread Zudio as Zucio, Zutio, etc.
    zudio_variations = [
        "zudio",
        "zucio",
        "zutio",
        "zud10",
        "zudlo"
    ]

    for line in lines:

        lower_line = line.lower()

        for variation in zudio_variations:

            if variation in lower_line:
                return "Zudio"

    # Fallback to company name
    for line in lines:

        if "trent limited" in line.lower():
            return "Trent Limited"

    return None

# ==========================================
# DESCRIPTION EXTRACTION
# ==========================================

def extract_description(text: str):

    descriptions = []

    for line in text.splitlines():

        line = line.strip()

        if not line:
            continue

        lower_line = line.lower()

        if not any(
            keyword in lower_line
            for keyword in [
                "footwear",
                "shoes",
                "sandals",
                "flip"
            ]
        ):
            continue

        # Remove HSN/product codes
        line = re.sub(
            r'\b\d{8,13}\b',
            ' ',
            line
        )

        # Remove decimal amounts
        line = re.sub(
            r'\b\d+(?:\.\d{1,2})?\b',
            ' ',
            line
        )

        # Remove common OCR noise
        line = re.sub(
            r'[^a-zA-Z\s]',
            ' ',
            line
        )

        # Normalize spaces
        line = re.sub(
            r'\s+',
            ' ',
            line
        ).strip()

        if line:
            descriptions.append(line)

    if descriptions:
        return " ".join(descriptions[:5])

    return None
# ==========================================
# RECEIPT PROCESSING + NLP
# ==========================================

def process_receipt(
    image_path: str
):

    text = extract_text_from_receipt(
        image_path
    )

    amount = extract_amount(text)

    receipt_date = extract_date(text)

    merchant = extract_merchant(text)

    description = extract_description(text)

    # --------------------------------------
    # Predict expense category
    # --------------------------------------

    predicted_category = None

    if description:

        predicted_category = (
            predict_expense_category(
                description
            )
        )

    return {
        "text": text,
        "merchant": merchant,
        "amount": amount,
        "date": receipt_date,
        "description": description,
        "predicted_category": predicted_category
    }