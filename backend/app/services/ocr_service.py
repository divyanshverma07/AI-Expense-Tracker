import os
import re
from datetime import datetime

import cv2
import pytesseract


# ============================================================
# TESSERACT CONFIGURATION
# ============================================================

TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

def preprocess_receipt(image_path):
    """
    Prepare receipt image for OCR.
    """

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Unable to read receipt image.")

    # Convert to grayscale
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # Upscale small receipts
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

    # Threshold
    threshold = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    return gray, threshold


# ============================================================
# OCR TEXT EXTRACTION
# ============================================================

def extract_text(image_path):
    """
    Extract text using multiple OCR modes.
    """

    gray, threshold = preprocess_receipt(
        image_path
    )

    texts = []

    # OCR mode 6
    text_psm6 = pytesseract.image_to_string(
        threshold,
        config="--psm 6"
    )

    texts.append(text_psm6)

    # OCR mode 11
    text_psm11 = pytesseract.image_to_string(
        threshold,
        config="--psm 11"
    )

    texts.append(text_psm11)

    # Fallback using grayscale image
    text_gray = pytesseract.image_to_string(
        gray,
        config="--psm 6"
    )

    texts.append(text_gray)

    # Choose the result with the most useful text
    best_text = max(
        texts,
        key=lambda text: len(
            clean_ocr_text(text)
        )
    )

    return best_text.strip()


# ============================================================
# CLEAN OCR TEXT
# ============================================================

def clean_ocr_text(text):
    """
    Remove excessive blank lines and spaces.
    """

    if not text:
        return ""

    lines = []

    for line in text.splitlines():

        line = line.strip()

        if not line:
            continue

        line = re.sub(
            r"\s+",
            " ",
            line
        )

        lines.append(line)

    return "\n".join(lines)


# ============================================================
# AMOUNT EXTRACTION
# ============================================================

def extract_amount(text):
    """
    Extract final payable / invoice amount.
    """

    if not text:
        return None

    # Priority patterns
    patterns = [
        # Amount due ₹400.00
        r"amount\s+due[^\d₹]*₹?\s*([\d,]+(?:\.\d{1,2})?)",

        # Grand Total ₹400.00
        r"grand\s+total[^\d₹]*₹?\s*([\d,]+(?:\.\d{1,2})?)",

        # Net Amount
        r"net\s+amount[^\d₹]*₹?\s*([\d,]+(?:\.\d{1,2})?)",

        # Total Amount
        r"total\s+amount[^\d₹]*₹?\s*([\d,]+(?:\.\d{1,2})?)",

        # Current Balance
        r"current\s+bal\.?[^\d₹]*₹?\s*([\d,]+(?:\.\d{1,2})?)",

        # Balance
        r"balance[^\d₹]*₹?\s*([\d,]+(?:\.\d{1,2})?)",

        # Total
        r"\btotal\b[^\d₹]*₹?\s*([\d,]+(?:\.\d{1,2})?)",
    ]

    # First try important labels
    for pattern in patterns:

        matches = re.findall(
            pattern,
            text,
            flags=re.IGNORECASE
        )

        if matches:

            try:
                values = [
                    float(
                        value.replace(",", "")
                    )
                    for value in matches
                ]

                if values:
                    return max(values)

            except ValueError:
                pass

    # Fallback:
    # Find all monetary-looking values
    amounts = re.findall(
        r"(?:₹|Rs\.?|INR)?\s*([\d,]+\.\d{1,2})",
        text,
        flags=re.IGNORECASE
    )

    values = []

    for value in amounts:

        try:
            values.append(
                float(value.replace(",", ""))
            )
        except ValueError:
            continue

    if values:
        return max(values)

    return None


# ============================================================
# DATE EXTRACTION
# ============================================================

def extract_date(text):
    """
    Extract invoice / bill date.
    Supports:
    DD/MM/YYYY
    DD-MM-YYYY
    DD.MM.YYYY
    YYYY-MM-DD
    """

    if not text:
        return None

    # Prefer dates near labels such as
    # Date of Issue / Invoice Date / Bill Date
    labelled_patterns = [
        r"(?:date\s+of\s+issue|invoice\s+date|bill\s+date|date)"
        r"[^\d]{0,30}"
        r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",

        r"(?:date\s+of\s+issue|invoice\s+date|bill\s+date|date)"
        r"[^\d]{0,30}"
        r"(\d{1,2}\.\d{1,2}\.\d{2,4})",
    ]

    for pattern in labelled_patterns:

        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE
        )

        if match:

            date_value = match.group(1)

            parsed = parse_date(
                date_value
            )

            if parsed:
                return parsed

    # Generic DD/MM/YYYY
    generic_patterns = [
        r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b",
        r"\b(\d{1,2}\.\d{1,2}\.\d{4})\b",
        r"\b(\d{4}-\d{1,2}-\d{1,2})\b",
    ]

    for pattern in generic_patterns:

        match = re.search(
            pattern,
            text
        )

        if match:

            parsed = parse_date(
                match.group(1)
            )

            if parsed:
                return parsed

    return None


def parse_date(value):
    """
    Convert different date formats to DD/MM/YYYY.
    """

    formats = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d.%m.%Y",
        "%Y-%m-%d",
        "%d/%m/%y",
        "%d-%m-%y",
        "%d.%m.%y",
    ]

    for fmt in formats:

        try:

            parsed = datetime.strptime(
                value,
                fmt
            )

            return parsed.strftime(
                "%d/%m/%Y"
            )

        except ValueError:
            continue

    return None


# ============================================================
# MERCHANT EXTRACTION
# ============================================================

def extract_merchant(text):
    """
    Extract merchant / shop name.

    Works with common receipt formats:
    - Zudio
    - Shree Computers
    - restaurants
    - shops
    - stores
    """

    if not text:
        return None

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    # --------------------------------------------------------
    # Known/common patterns
    # --------------------------------------------------------

    known_patterns = [
        r"\bzudio\b",
        r"\btrent limited\b",
        r"\bshree computers\b",
    ]

    for pattern in known_patterns:

        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE
        )

        if match:

            return match.group(0).strip().title()

    # --------------------------------------------------------
    # Try first meaningful business-looking line
    # --------------------------------------------------------

    ignored = [
        "amount due",
        "invoice",
        "receipt",
        "bill",
        "tax invoice",
        "thank you",
        "date",
        "bill to",
        "ref no",
        "ref",
        "total",
        "balance",
        "current bal",
    ]

    for line in lines[:12]:

        lower = line.lower()

        # Ignore obvious non-merchant lines
        if any(
            item in lower
            for item in ignored
        ):
            continue

        # Ignore lines containing only numbers
        if re.fullmatch(
            r"[\d\s₹.,:+\-()]+",
            line
        ):
            continue

        # Ignore phone-number lines
        digits = re.sub(
            r"\D",
            "",
            line
        )

        if len(digits) >= 10:
            continue

        # Ignore very short OCR noise
        if len(line) < 3:
            continue

        # Merchant is usually near the top
        if len(line) <= 80:
            return line

    return None


# ============================================================
# DESCRIPTION EXTRACTION
# ============================================================

def extract_description(text):
    """
    Extract purchased item / transaction description.

    Supports:
    - Laptop charger
    - Shoes
    - Food items
    - Restaurant purchases
    - Generic receipt item rows
    """

    if not text:
        return None

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    # --------------------------------------------------------
    # First look for common item-table patterns
    # --------------------------------------------------------

    for line in lines:

        lower = line.lower()

        # Skip totals and headers
        if any(
            keyword in lower
            for keyword in [
                "amount due",
                "bill to",
                "ref no",
                "date of issue",
                "thank you",
                "current bal",
                "balance",
                "grand total",
                "net amount",
            ]
        ):
            continue

        # Pattern:
        # 1 Laptop charger 1.0Pcs 400.00 400.00
        match = re.match(
            r"^\s*\d+\s+(.+?)"
            r"\s+\d+(?:\.\d+)?\s*(?:pcs|pc|piece|qty)?"
            r"\s+\d+(?:\.\d{1,2})?"
            r"\s+\d+(?:\.\d{1,2})?"
            r"\s*$",
            line,
            flags=re.IGNORECASE
        )

        if match:

            description = match.group(1).strip()

            if len(description) >= 3:
                return description

    # --------------------------------------------------------
    # Generic known purchase keywords
    # --------------------------------------------------------

    purchase_keywords = [
        "laptop",
        "charger",
        "shoes",
        "sandals",
        "shirt",
        "jeans",
        "food",
        "pizza",
        "burger",
        "grocery",
        "groceries",
        "medicine",
        "tablet",
        "mobile",
        "headphone",
        "keyboard",
        "mouse",
        "cable",
        "restaurant",
        "dinner",
        "lunch",
        "breakfast",
    ]

    candidates = []

    for line in lines:

        lower = line.lower()

        if any(
            keyword in lower
            for keyword in purchase_keywords
        ):

            # Remove leading serial number
            cleaned = re.sub(
                r"^\s*\d+\s+",
                "",
                line
            )

            # Remove monetary values
            cleaned = re.sub(
                r"₹?\s*[\d,]+\.\d{1,2}",
                "",
                cleaned
            )

            # Remove quantities
            cleaned = re.sub(
                r"\b\d+(?:\.\d+)?\s*(?:pcs|pc|qty)\b",
                "",
                cleaned,
                flags=re.IGNORECASE
            )

            cleaned = re.sub(
                r"\s+",
                " ",
                cleaned
            ).strip()

            if len(cleaned) >= 3:
                candidates.append(cleaned)

    if candidates:
        return candidates[0]

    return None


# ============================================================
# PROCESS COMPLETE RECEIPT
# ============================================================

def process_receipt(image_path):
    """
    Complete receipt processing pipeline.
    """

    raw_text = extract_text(
        image_path
    )

    cleaned_text = clean_ocr_text(
        raw_text
    )

    merchant = extract_merchant(
        cleaned_text
    )

    amount = extract_amount(
        cleaned_text
    )

    date = extract_date(
        cleaned_text
    )

    description = extract_description(
        cleaned_text
    )

    # --------------------------------------------------------
    # AI CATEGORY PREDICTION
    # --------------------------------------------------------

    predicted_category = None

    if description:

        try:

            from .expense_classifier import (
                predict_category
            )

            predicted_category = (
                predict_category(
                    description
                )
            )

        except Exception:
            predicted_category = None

    return {
        "text": cleaned_text,
        "merchant": merchant,
        "amount": amount,
        "date": date,
        "description": description,
        "predicted_category": predicted_category,
    }