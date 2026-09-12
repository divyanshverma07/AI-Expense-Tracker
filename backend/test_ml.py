from app.ml_service import predict_expense_category


test_transactions = [
    "Ordered pizza for dinner",
    "Bought vegetables from supermarket",
    "Paid electricity bill",
    "Purchased medicine from pharmacy",
    "Paid monthly apartment rent",
    "Bought a pair of jeans",
    "Renewed Spotify Premium",
    "Paid my bike EMI",
    "Booked a hotel for Goa trip",
    "Paid for a haircut"
]


for transaction in test_transactions:

    category = predict_expense_category(
        transaction
    )

    print(
        f"{transaction} -> {category}"
    )