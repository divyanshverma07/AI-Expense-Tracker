import { useEffect, useState } from "react";
import {
  CalendarDays,
  Edit3,
  IndianRupee,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";

import api, { apiMessage } from "../lib/api";
import Spinner from "../components/ui/Spinner";

export default function Income() {
  const [incomes, setIncomes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    amount: "",
    source: "",
    income_date: getToday(),
  });

  /* =========================================
     LOAD INCOME
  ========================================= */

  useEffect(() => {
    loadIncome();
  }, []);

  async function loadIncome() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/income/");

      setIncomes(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      setError(
        apiMessage(
          error,
          "Unable to load income."
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
     ADD / UPDATE
  ========================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      setError(
        "Please enter a valid income amount."
      );
      return;
    }

    if (!form.source.trim()) {
      setError(
        "Please enter the income source."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        amount: Number(form.amount),
        source: form.source.trim(),
        income_date: form.income_date,
      };

      let response;

      if (editingId) {
        response = await api.put(
          `/income/${editingId}`,
          payload
        );

        setIncomes((previous) =>
          previous.map((income) =>
            income.income_id === editingId
              ? response.data
              : income
          )
        );
      } else {
        response = await api.post(
          "/income/",
          payload
        );

        setIncomes((previous) => [
          response.data,
          ...previous,
        ]);
      }

      resetForm();
    } catch (error) {
      setError(
        apiMessage(
          error,
          "Unable to save income."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================
     EDIT
  ========================================= */

  function handleEdit(income) {
    setEditingId(income.income_id);

    setForm({
      amount: income.amount ?? "",
      source: income.source ?? "",
      income_date:
        income.income_date ||
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

  async function handleDelete(incomeId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this income?"
    );

    if (!confirmed) return;

    setError("");

    try {
      await api.delete(
        `/income/${incomeId}`
      );

      setIncomes((previous) =>
        previous.filter(
          (income) =>
            income.income_id !== incomeId
        )
      );
    } catch (error) {
      setError(
        apiMessage(
          error,
          "Unable to delete income."
        )
      );
    }
  }

  /* =========================================
     RESET
  ========================================= */

  function resetForm() {
    setEditingId(null);

    setForm({
      amount: "",
      source: "",
      income_date: getToday(),
    });
  }

  /* =========================================
     SEARCH
  ========================================= */

  const filteredIncome =
    incomes.filter((income) => {
      const text =
        `${income.source || ""}`.toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    });

  /* =========================================
     TOTAL
  ========================================= */

  const totalIncome =
    incomes.reduce(
      (total, income) =>
        total +
        Number(income.amount || 0),
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
            Money Management
          </span>

          <h1>
            Income
          </h1>

          <p>
            Track your earnings and income
            sources in one place.
          </p>
        </div>

        <div className="income-header-total">

          <span>
            Total income
          </span>

          <strong>
            {money(totalIncome)}
          </strong>

        </div>

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
          ADD INCOME
      ===================================== */}

      <section className="card income-form-card">

        <div className="card-heading">

          <div>

            <h2>
              {editingId
                ? "Edit income"
                : "Add income"}
            </h2>

            <p>
              Add your salary, freelance,
              business or other earnings.
            </p>

          </div>

          <div className="income-icon">
            <Wallet size={20} />
          </div>

        </div>


        <form
          className="income-form"
          onSubmit={handleSubmit}
        >

          {/* AMOUNT */}

          <div className="form-field">

            <label>
              Amount (₹)
            </label>

            <div className="money-input">

              <IndianRupee size={15} />

              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter income amount"
                value={form.amount}
                onChange={handleChange}
              />

            </div>

          </div>


          {/* DATE */}

          <div className="form-field">

            <label>
              Date
            </label>

            <div className="input-icon">

              <CalendarDays size={15} />

              <input
                name="income_date"
                type="date"
                value={form.income_date}
                onChange={handleChange}
              />

            </div>

          </div>


          {/* SOURCE */}

          <div className="form-field income-source-field">

            <label>
              Income source
            </label>

            <input
              name="source"
              type="text"
              placeholder="e.g. Salary, Freelance, Business"
              value={form.source}
              onChange={handleChange}
            />

          </div>


          {/* BUTTON */}

          <div className="income-form-submit">

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
                "Update income"
              ) : (
                "Add income"
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


      {/* =====================================
          INCOME HISTORY
      ===================================== */}

      <section className="card income-history-card">

        <div className="card-heading">

          <div>

            <h2>
              Income history
            </h2>

            <p>
              Your recorded income transactions.
            </p>

          </div>


          <div className="income-search">

            <Search size={15} />

            <input
              type="text"
              placeholder="Search income…"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>


        {loading ? (
          <PageLoader />
        ) : filteredIncome.length === 0 ? (

          <div className="empty-state compact">

            <div className="empty-icon">
              <Wallet size={22} />
            </div>

            <h3>
              {search
                ? "No matching income"
                : "No income yet"}
            </h3>

            <p>
              {search
                ? "Try another search."
                : "Add your first income to start tracking your earnings."}
            </p>

          </div>

        ) : (

          <div className="income-table">

            <div className="income-table-header">

              <span>
                Source
              </span>

              <span>
                Date
              </span>

              <span>
                Amount
              </span>

              <span>
                Actions
              </span>

            </div>


            {filteredIncome.map(
              (income) => (

                <div
                  className="income-table-row"
                  key={income.income_id}
                >

                  <div className="income-source">

                    <div className="income-row-icon">
                      <Wallet size={15} />
                    </div>

                    <strong>
                      {income.source}
                    </strong>

                  </div>


                  <span className="muted-text">

                    {formatDate(
                      income.income_date
                    )}

                  </span>


                  <strong className="income-amount">

                    +{money(
                      income.amount
                    )}

                  </strong>


                  <div className="income-actions">

                    <button
                      type="button"
                      title="Edit"
                      onClick={() =>
                        handleEdit(income)
                      }
                    >
                      <Edit3 size={15} />
                    </button>


                    <button
                      type="button"
                      title="Delete"
                      onClick={() =>
                        handleDelete(
                          income.income_id
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


function getToday() {
  const date = new Date();

  return date
    .toISOString()
    .split("T")[0];
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
        Loading income…
      </span>

    </div>
  );
}