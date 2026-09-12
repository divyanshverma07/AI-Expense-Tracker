import os
import re
import joblib
from scipy.sparse import hstack


# ==================================================
# MODEL DIRECTORY
# ==================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_DIR = os.path.join(
    BASE_DIR,
    "ml_models"
)


# ==================================================
# MODEL PATHS
# ==================================================

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "expense_category_model.pkl"
)

WORD_TFIDF_PATH = os.path.join(
    MODEL_DIR,
    "word_tfidf.pkl"
)

CHAR_TFIDF_PATH = os.path.join(
    MODEL_DIR,
    "char_tfidf.pkl"
)


# ==================================================
# LOAD NLP MODELS
# ==================================================

expense_category_model = joblib.load(
    MODEL_PATH
)

word_tfidf = joblib.load(
    WORD_TFIDF_PATH
)

char_tfidf = joblib.load(
    CHAR_TFIDF_PATH
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
# EXPENSE CATEGORY PREDICTION
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