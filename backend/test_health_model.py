import os
import joblib


MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "app",
    "ml_models",
    "financial_health_model.pkl"
)


model = joblib.load(MODEL_PATH)


print("Model type:")
print(type(model))

print("\nModel:")
print(model)

print("\nModel attributes:")

if hasattr(model, "n_features_in_"):
    print(
        "n_features_in_:",
        model.n_features_in_
    )

if hasattr(model, "coef_"):
    print(
        "coef_ shape:",
        model.coef_.shape
    )

if hasattr(model, "classes_"):
    print(
        "classes_:",
        model.classes_
    )