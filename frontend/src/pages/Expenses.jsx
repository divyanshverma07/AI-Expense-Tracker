import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Camera,
  Edit3,
  Receipt,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import api, { apiMessage } from "../lib/api";
import Spinner from "../components/ui/Spinner";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    amount: "",
    description: "",
    payment_method: "",
    expense_date: getToday(),
  });

  const [editingId, setEditingId] = useState(null);

  const [receiptLoading, setReceiptLoading] =
    useState(false);

  const [receiptData, setReceiptData] =
    useState(null);

  const [showReceipt, setShowReceipt] =
    useState(false);

  const fileInputRef = useRef(null);


  /* =========================================
     LOAD EXPENSES
  ========================================= */

  useEffect(() => {
    loadExpenses();
  }, []);


  async function loadExpenses() {
    setLoading(true);
    setError("");

    try {
      const response =
        await api.get("/expenses/");

      setExpenses(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      setError(
        apiMessage(
          error,
          "Unable to load expenses."
        )
      );
    } finally {
      setLoading(false);
    }
  }


  /* =========================================
     FORM CHANGE
  ========================================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


  /* =========================================
     ADD / UPDATE EXPENSE
  ========================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter an expense description.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        amount: Number(form.amount),
        description: form.description.trim(),
        payment_method:
          form.payment_method || null,
        expense_date: form.expense_date,
      };

      let response;

      if (editingId) {
        response = await api.put(
          `/expenses/${editingId}`,
          payload
        );

        setExpenses((previous) =>
          previous.map((expense) =>
            expense.expense_id === editingId
              ? response.data
              : expense
          )
        );
      } else {
        response = await api.post(
          "/expenses/",
          payload
        );

        setExpenses((previous) => [
          response.data,
          ...previous,
        ]);
      }

      resetForm();

    } catch (error) {
      setError(
        apiMessage(
          error,
          "Unable to save expense."
        )
      );
    } finally {
      setSaving(false);
    }
  }


  /* =========================================
     EDIT
  ========================================= */

  function handleEdit(expense) {
    setEditingId(expense.expense_id);

    setForm({
      amount: expense.amount ?? "",
      description:
        expense.description ?? "",
      payment_method:
        expense.payment_method ?? "",
      expense_date:
        expense.expense_date ??
        getToday(),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  /* =========================================
     DELETE
  ========================================= */

  async function handleDelete(expenseId) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this expense?"
      );

    if (!confirmed) return;

    setError("");

    try {
      await api.delete(
        `/expenses/${expenseId}`
      );

      setExpenses((previous) =>
        previous.filter(
          (expense) =>
            expense.expense_id !== expenseId
        )
      );
    } catch (error) {
      setError(
        apiMessage(
          error,
          "Unable to delete expense."
        )
      );
    }
  }


  /* =========================================
     RESET FORM
  ========================================= */

  function resetForm() {
    setEditingId(null);

    setForm({
      amount: "",
      description: "",
      payment_method: "",
      expense_date: getToday(),
    });
  }


  /* =========================================
     RECEIPT FILE
  ========================================= */

  function handleReceiptClick() {
    fileInputRef.current?.click();
  }


  async function handleReceiptUpload(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setReceiptLoading(true);
    setError("");

    const formData = new FormData();

    formData.append("file", file);

    try {
      const response =
        await api.post(
          "/expenses/scan-receipt",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      setReceiptData(response.data);
      setShowReceipt(true);

    } catch (error) {
      setError(
        apiMessage(
          error,
          "Unable to scan receipt."
        )
      );
    } finally {
      setReceiptLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }


  /* =========================================
     USE OCR RESULT
  ========================================= */

  function useReceiptData() {
    if (!receiptData) return;

    setForm({
      amount:
        receiptData.amount ?? "",

      description:
        receiptData.description ||
        receiptData.merchant ||
        "",

      payment_method: "",

      expense_date:
        receiptData.date ||
        getToday(),
    });

    setShowReceipt(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  /* =========================================
     FILTER
  ========================================= */

  const filteredExpenses =
    expenses.filter((expense) => {
      const value =
        `${expense.description || ""} ${
          expense.category || ""
        } ${
          expense.payment_method || ""
        }`.toLowerCase();

      return value.includes(
        search.toLowerCase()
      );
    });


  /* =========================================
     TOTAL
  ========================================= */

  const totalExpenses =
    expenses.reduce(
      (total, expense) =>
        total +
        Number(expense.amount || 0),
      0
    );


  return (
    <div className="page">

      {/* =================================
          HEADER
      ================================= */}

      <div className="page-heading">

        <div>
          <span className="eyebrow">
            Money Management
          </span>

          <h1>
            Expenses
          </h1>

          <p>
            Track your spending with AI-powered
            expense categorization.
          </p>
        </div>

        <div className="expense-header-total">
          <span>
            Total expenses
          </span>

          <strong>
            {money(totalExpenses)}
          </strong>
        </div>

      </div>


      {/* =================================
          ERROR
      ================================= */}

      {error && (
        <div className="alert error page-alert">
          {error}
        </div>
      )}


      {/* =================================
          ADD EXPENSE
      ================================= */}

      <section className="card expense-form-card">

        <div className="card-heading">

          <div>
            <h2>
              {editingId
                ? "Edit expense"
                : "Add expense"}
            </h2>

            <p>
              Enter your transaction details.
              AI will predict the category.
            </p>
          </div>

          <div className="expense-form-actions">

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleReceiptUpload}
              hidden
            />

            <button
              type="button"
              className="secondary-btn"
              onClick={handleReceiptClick}
              disabled={receiptLoading}
            >
              {receiptLoading ? (
                <>
                  <Spinner size={15} />
                  Scanning…
                </>
              ) : (
                <>
                  <Camera size={16} />
                  Scan receipt
                </>
              )}
            </button>

          </div>

        </div>


        <form
          className="expense-form"
          onSubmit={handleSubmit}
        >

          <div className="form-field">

            <label>
              Amount (₹)
            </label>

            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              value={form.amount}
              onChange={handleChange}
            />

          </div>


          <div className="form-field">

            <label>
              Date
            </label>

            <div className="input-icon">

              <CalendarDays size={15} />

              <input
                name="expense_date"
                type="date"
                value={form.expense_date}
                onChange={handleChange}
              />

            </div>

          </div>


          <div className="form-field form-field-wide">

            <label>
              Description
            </label>

            <input
              name="description"
              type="text"
              placeholder="e.g. Ordered dinner from restaurant"
              value={form.description}
              onChange={handleChange}
            />

          </div>


          <div className="form-field">

            <label>
              Payment method
            </label>

            <select
              name="payment_method"
              value={form.payment_method}
              onChange={handleChange}
            >
              <option value="">
                Select method
              </option>

              <option value="Cash">
                Cash
              </option>

              <option value="UPI">
                UPI
              </option>

              <option value="Debit Card">
                Debit Card
              </option>

              <option value="Credit Card">
                Credit Card
              </option>

              <option value="Bank Transfer">
                Bank Transfer
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          <div className="expense-form-submit">

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >

              {saving ? (
                <>
                  <Spinner size={15} />
                  Saving…
                </>
              ) : (
                editingId
                  ? "Update expense"
                  : "Add expense"
              )}

            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </section>


      {/* =================================
          EXPENSE HISTORY
      ================================= */}

      <section className="card expense-history-card">

        <div className="card-heading">

          <div>
            <h2>
              Expense history
            </h2>

            <p>
              Your recorded transactions.
            </p>
          </div>

          <div className="expense-search">

            <Search size={15} />

            <input
              type="text"
              placeholder="Search expenses…"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>


        {loading ? (
          <PageLoader />
        ) : filteredExpenses.length === 0 ? (

          <div className="empty-state compact">

            <div className="empty-icon">
              <Receipt size={22} />
            </div>

            <h3>
              {search
                ? "No matching expenses"
                : "No expenses yet"}
            </h3>

            <p>
              {search
                ? "Try another search."
                : "Add your first expense to start tracking your spending."}
            </p>

          </div>

        ) : (

          <div className="expense-table">

            <div className="expense-table-header">

              <span>
                Description
              </span>

              <span>
                Category
              </span>

              <span>
                Date
              </span>

              <span>
                Payment
              </span>

              <span>
                Amount
              </span>

              <span>
                Actions
              </span>

            </div>


            {filteredExpenses.map(
              (expense) => (

                <div
                  className="expense-table-row"
                  key={expense.expense_id}
                >

                  <div className="expense-description">

                    <strong>
                      {expense.description}
                    </strong>

                  </div>


                  <span>
                    <CategoryBadge
                      category={
                        expense.category
                      }
                    />
                  </span>


                  <span className="muted-text">
                    {formatDate(
                      expense.expense_date
                    )}
                  </span>


                  <span className="muted-text">
                    {expense.payment_method ||
                      "—"}
                  </span>


                  <strong className="expense-amount">
                    {money(
                      expense.amount
                    )}
                  </strong>


                  <div className="expense-actions">

                    <button
                      type="button"
                      title="Edit"
                      onClick={() =>
                        handleEdit(expense)
                      }
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      type="button"
                      title="Delete"
                      onClick={() =>
                        handleDelete(
                          expense.expense_id
                        )
                      }
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* =================================
          RECEIPT RESULT MODAL
      ================================= */}

      {showReceipt &&
        receiptData && (
          <div className="modal-backdrop">

            <div className="card receipt-modal">

              <div className="receipt-modal-header">

                <div>
                  <span className="eyebrow">
                    OCR Result
                  </span>

                  <h2>
                    Receipt scanned
                  </h2>
                </div>

                <button
                  className="icon-btn"
                  onClick={() =>
                    setShowReceipt(false)
                  }
                >
                  <X size={18} />
                </button>

              </div>


              <div className="receipt-preview">

                <ReceiptRow
                  label="Merchant"
                  value={
                    receiptData.merchant ||
                    "Not detected"
                  }
                />

                <ReceiptRow
                  label="Amount"
                  value={
                    receiptData.amount
                      ? money(
                          receiptData.amount
                        )
                      : "Not detected"
                  }
                />

                <ReceiptRow
                  label="Date"
                  value={
                    receiptData.date ||
                    "Not detected"
                  }
                />

                <ReceiptRow
                  label="Description"
                  value={
                    receiptData.description ||
                    "Not detected"
                  }
                />

                <ReceiptRow
                  label="AI category"
                  value={
                    receiptData.predicted_category ||
                    "Not detected"
                  }
                />

              </div>


              <div className="receipt-modal-note">

                <Upload size={15} />

                <span>
                  Review the detected information
                  before adding it to your expenses.
                </span>

              </div>


              <div className="receipt-modal-actions">

                <button
                  className="secondary-btn"
                  onClick={() =>
                    setShowReceipt(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="primary-btn"
                  onClick={useReceiptData}
                >
                  Use this receipt
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}


/* =========================================
   CATEGORY BADGE
========================================= */

function CategoryBadge({
  category,
}) {
  return (
    <span
      className={`category-badge category-${String(
        category || "miscellaneous"
      )
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")}`}
    >
      {category || "Miscellaneous"}
    </span>
  );
}


/* =========================================
   RECEIPT ROW
========================================= */

function ReceiptRow({
  label,
  value,
}) {
  return (
    <div className="receipt-row">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


/* =========================================
   HELPERS
========================================= */

function money(value) {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}


function getToday() {
  const date = new Date();

  return date.toISOString().split("T")[0];
}


function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner size={28} />
      <span>
        Loading expenses…
      </span>
    </div>
  );
}