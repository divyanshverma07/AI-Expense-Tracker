import os
import re
import joblib
from scipy.sparse import hstack


# ==================================================
# MODEL DIRECTORY
# ==================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "ml_models"
)


# ==================================================
# LOAD MODELS
# ==================================================

expense_category_model = joblib.load(
    os.path.join(
        MODEL_DIR,
        "expense_category_model.pkl"
    )
)

word_tfidf = joblib.load(
    os.path.join(
        MODEL_DIR,
        "word_tfidf.pkl"
    )
)

char_tfidf = joblib.load(
    os.path.join(
        MODEL_DIR,
        "char_tfidf.pkl"
    )
)


# ==================================================
# TEXT CLEANING
# ==================================================

def clean_transaction(text: str) -> str:

    text = str(text).lower()

    text = re.sub(
        r'inr\s*[\d,]+(?:\.\d+)?',
        ' ',
        text
    )

    text = re.sub(
        r'ref\s*\d+',
        ' ',
        text
    )

    text = re.sub(
        r'\d+(?:\.\d+)?',
        ' ',
        text
    )

    text = re.sub(
        r'[^a-z\s]',
        ' ',
        text
    )

    text = re.sub(
        r'\s+',
        ' ',
        text
    )

    return text.strip()


# ==================================================
# PREDICT CATEGORY
# ==================================================

def predict_expense_category(
    description: str
) -> str:

    cleaned_text = clean_transaction(
        description
    )

    word_features = word_tfidf.transform(
        [cleaned_text]
    )

    char_features = char_tfidf.transform(
        [cleaned_text]
    )

    combined_features = hstack([
        word_features,
        char_features
    ])

    prediction = expense_category_model.predict(
        combined_features
    )

    return str(prediction[0])