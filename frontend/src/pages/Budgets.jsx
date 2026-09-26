import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import api, { apiMessage } from "../lib/api";
import Spinner from "../components/ui/Spinner";

const CATEGORIES = [
  "Food",
  "Groceries",
  "Transport",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Education",
  "Rent",
  "Utilities",
  "Insurance",
  "EMI",
  "Fitness",
  "Travel",
  "Personal_Care",
  "Subscription",
  "Investment",
  "Gifts_Donations",
  "Miscellaneous",
];

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const today = new Date();

  const [form, setForm] = useState({
    category: "Food",
    monthly_limit: "",
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  });

  /* =========================================
     LOAD BUDGETS
  ========================================= */

  useEffect(() => {
    loadBudgets();
  }, []);

  async function loadBudgets() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/budget/");

      setBudgets(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      setError(
        apiMessage(
          error,
          "Unable to load budgets."
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
      [name]:
        name === "month" || name === "year"
          ? Number(value)
          : value,
    }));
  }

  /* =========================================
     OPEN ADD FORM
  ========================================= */

  function openAddForm() {
    setEditingId(null);

    const currentDate = new Date();

    setForm({
      category: "Food",
      monthly_limit: "",
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    });

    setShowForm(true);
    setError("");
  }

  /* =========================================
     EDIT
  ========================================= */

  function handleEdit(budget) {
    setEditingId(budget.budget_id);

    setForm({
      category: budget.category || "Food",
      monthly_limit:
        budget.monthly_limit || "",
      month: Number(budget.month),
      year: Number(budget.year),
    });

    setShowForm(true);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================
     SAVE
  ========================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.category.trim()) {
      setError("Please select a category.");
      return;
    }

    if (
      !form.monthly_limit ||
      Number(form.monthly_limit) <= 0
    ) {
      setError(
        "Please enter a valid monthly limit."
      );
      return;
    }

    if (
      !form.month ||
      Number(form.month) < 1 ||
      Number(form.month) > 12
    ) {
      setError("Please select a valid month.");
      return;
    }

    if (
      !form.year ||
      Number(form.year) < 2000
    ) {
      setError("Please enter a valid year.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        category: form.category.trim(),
        monthly_limit: Number(
          form.monthly_limit
        ),
        month: Number(form.month),
        year: Number(form.year),
      };

      let response;

      if (editingId) {
        response = await api.put(
          `/budget/${editingId}`,
          payload
        );

        setBudgets((previous) =>
          previous.map((budget) =>
            budget.budget_id === editingId
              ? response.data
              : budget
          )
        );
      } else {
        response = await api.post(
          "/budget/",
          payload
        );

        setBudgets((previous) => [
          response.data,
          ...previous,
        ]);
      }

      closeForm();
    } catch (error) {
      setError(
        apiMessage(
          error,
          "Unable to save budget."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================
     DELETE
  ========================================= */

  async function handleDelete(budgetId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) return;

    setError("");

    try {
      await api.delete(
        `/budget/${budgetId}`
      );

      setBudgets((previous) =>
        previous.filter(
          (budget) =>
            budget.budget_id !== budgetId
        )
      );
    } catch (error) {
      setError(
        apiMessage(
          error,
          "Unable to delete budget."
        )
      );
    }
  }

  /* =========================================
     CLOSE FORM
  ========================================= */

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
  }

  /* =========================================
     SEARCH
  ========================================= */

  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      const text =
        `${budget.category || ""} ${
          budget.month || ""
        } ${budget.year || ""}`.toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    });
  }, [budgets, search]);

  /* =========================================
     CURRENT MONTH
  ========================================= */

  const currentDate = new Date();

  const currentMonth =
    currentDate.getMonth() + 1;

  const currentYear =
    currentDate.getFullYear();

  const currentBudgets =
    budgets.filter(
      (budget) =>
        Number(budget.month) ===
          currentMonth &&
        Number(budget.year) === currentYear
    );

  const currentTotal = currentBudgets.reduce(
    (total, budget) =>
      total +
      Number(
        budget.monthly_limit || 0
      ),
    0
  );

  return (
    <div className="page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="page-heading">

        <div>

          <span className="eyebrow">
            Money Planning
          </span>

          <h1>
            Budgets
          </h1>

          <p>
            Set monthly spending limits and keep
            your expenses under control.
          </p>

        </div>

        <button
          className="primary-btn"
          onClick={openAddForm}
        >
          <Plus size={16} />
          Add budget
        </button>

      </div>


      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="alert error page-alert">
          {error}
        </div>
      )}


      {/* =====================================
          CURRENT MONTH SUMMARY
      ===================================== */}

      <section className="budget-summary-grid">

        <div className="card budget-summary-card">

          <div className="budget-summary-icon">
            <CreditCard size={19} />
          </div>

          <div>

            <span>
              Current month budget
            </span>

            <strong>
              {money(currentTotal)}
            </strong>

            <p>
              {monthName(currentMonth)}{" "}
              {currentYear}
            </p>

          </div>

        </div>


        <div className="card budget-summary-card">

          <div className="budget-summary-icon">
            <CreditCard size={19} />
          </div>

          <div>

            <span>
              Budget categories
            </span>

            <strong>
              {currentBudgets.length}
            </strong>

            <p>
              Active budget entries
            </p>

          </div>

        </div>

      </section>


      {/* =====================================
          FORM
      ===================================== */}

      {showForm && (
        <section className="card budget-form-card">

          <div className="card-heading">

            <div>

              <h2>
                {editingId
                  ? "Edit budget"
                  : "Create budget"}
              </h2>

              <p>
                Set a spending limit for a category.
              </p>

            </div>

            <button
              className="icon-btn"
              onClick={closeForm}
              type="button"
            >
              <X size={18} />
            </button>

          </div>


          <form
            className="budget-form"
            onSubmit={handleSubmit}
          >

            <div className="form-field">

              <label>
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >

                {CATEGORIES.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}

              </select>

            </div>


            <div className="form-field">

              <label>
                Monthly limit (₹)
              </label>

              <input
                name="monthly_limit"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 5000"
                value={form.monthly_limit}
                onChange={handleChange}
              />

            </div>


            <div className="form-field">

              <label>
                Month
              </label>

              <select
                name="month"
                value={form.month}
                onChange={handleChange}
              >

                {Array.from(
                  { length: 12 },
                  (_, index) => {
                    const value = index + 1;

                    return (
                      <option
                        key={value}
                        value={value}
                      >
                        {monthName(value)}
                      </option>
                    );
                  }
                )}

              </select>

            </div>


            <div className="form-field">

              <label>
                Year
              </label>

              <input
                name="year"
                type="number"
                min="2000"
                max="2100"
                value={form.year}
                onChange={handleChange}
              />

            </div>


            <div className="budget-form-submit">

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
                ) : editingId ? (
                  "Update budget"
                ) : (
                  "Create budget"
                )}

              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </section>
      )}


      {/* =====================================
          BUDGET LIST
      ===================================== */}

      <section className="card budget-history-card">

        <div className="card-heading">

          <div>

            <h2>
              Budget history
            </h2>

            <p>
              Your category-wise monthly limits.
            </p>

          </div>


          <div className="budget-search">

            <Search size={15} />

            <input
              type="text"
              placeholder="Search budgets…"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>


        {loading ? (

          <PageLoader />

        ) : filteredBudgets.length === 0 ? (

          <div className="empty-state compact">

            <div className="empty-icon">
              <CreditCard size={22} />
            </div>

            <h3>
              {search
                ? "No matching budgets"
                : "No budgets yet"}
            </h3>

            <p>
              {search
                ? "Try another search."
                : "Create a budget to start controlling your spending."}
            </p>

          </div>

        ) : (

          <div className="budget-table">

            <div className="budget-table-header">

              <span>
                Category
              </span>

              <span>
                Month
              </span>

              <span>
                Monthly limit
              </span>

              <span>
                Actions
              </span>

            </div>


            {filteredBudgets.map(
              (budget) => (

                <div
                  className="budget-table-row"
                  key={budget.budget_id}
                >

                  <div className="budget-category">

                    <div className="budget-category-icon">
                      <CreditCard size={14} />
                    </div>

                    <strong>
                      {formatCategory(
                        budget.category
                      )}
                    </strong>

                  </div>


                  <span className="muted-text">

                    {monthName(
                      Number(budget.month)
                    )}{" "}
                    {budget.year}

                  </span>


                  <strong className="budget-limit">

                    {money(
                      budget.monthly_limit
                    )}

                  </strong>


                  <div className="budget-actions">

                    <button
                      type="button"
                      title="Edit"
                      onClick={() =>
                        handleEdit(budget)
                      }
                    >
                      <Edit3 size={15} />
                    </button>


                    <button
                      type="button"
                      title="Delete"
                      onClick={() =>
                        handleDelete(
                          budget.budget_id
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


function monthName(month) {
  return new Date(
    2000,
    Number(month) - 1,
    1
  ).toLocaleDateString("en-IN", {
    month: "long",
  });
}


function formatCategory(category) {
  if (!category) return "Miscellaneous";

  return String(category)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}


function PageLoader() {
  return (
    <div className="page-loader">

      <Spinner size={28} />

      <span>
        Loading budgets…
      </span>

    </div>
  );
}