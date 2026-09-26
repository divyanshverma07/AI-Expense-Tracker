import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import api, { apiMessage } from "../lib/api";
import Spinner from "../components/ui/Spinner";

export default function FinancialInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/financial-insights/")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        setError(
          apiMessage(
            error,
            "Unable to load financial insights."
          )
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-heading">

        <div>

          <Link
            to="/dashboard"
            className="back-link"
          >
            <ArrowLeft size={15} />
            Dashboard
          </Link>

          <span className="eyebrow">
            AI Assistant
          </span>

          <h1>
            Financial Insights
          </h1>

          <p>
            Personalized observations and
            recommendations based on your
            financial activity.
          </p>

        </div>

      </div>


      {/* ERROR */}
      {error && (
        <div className="card prediction-error">

          <div className="prediction-error-icon">
            !
          </div>

          <div>

            <h3>
              Insights unavailable
            </h3>

            <p>
              {error}
            </p>

          </div>

        </div>
      )}


      {data && (
        <>

          {/* FINANCIAL SNAPSHOT */}
          <section className="insights-snapshot-grid">

            <SnapshotCard
              label="Monthly income"
              value={money(
                data.monthly_income
              )}
              type="income"
            />

            <SnapshotCard
              label="Monthly expenses"
              value={money(
                data.monthly_expenses
              )}
              type="expense"
            />

            <SnapshotCard
              label="Monthly savings"
              value={money(
                data.monthly_savings
              )}
              type="saving"
            />

            <SnapshotCard
              label="Savings rate"
              value={`${Number(
                data.savings_rate || 0
              ).toFixed(1)}%`}
              type="rate"
            />

          </section>


          {/* INSIGHTS */}
          <section className="card insights-page-card">

            <div className="card-heading">

              <div>

                <h2>
                  Your AI insights
                </h2>

                <p>
                  Key observations from your
                  financial activity.
                </p>

              </div>

              <Sparkles
                size={21}
                className="insights-sparkle"
              />

            </div>


            <div className="insights-page-list">

              {Array.isArray(data.insights) &&
                data.insights.map(
                  (insight, index) => (

                    <InsightCard
                      key={`${insight.title}-${index}`}
                      insight={insight}
                    />

                  )
                )}

            </div>

          </section>


          {/* RECOMMENDATION */}
          {data.recommendation && (
            <section className="card recommendation-page-card">

              <div className="recommendation-page-icon">
                <Lightbulb size={22} />
              </div>

              <div>

                <span>
                  AI Recommendation
                </span>

                <h2>
                  What you should focus on
                </h2>

                <p>
                  {data.recommendation}
                </p>

              </div>

            </section>
          )}


          {/* ACTION */}
          <section className="card insights-action-card">

            <div>

              <h2>
                Keep improving your finances
              </h2>

              <p>
                Use your insights together with
                budgets and goals to build better
                financial habits.
              </p>

            </div>

            <Link
              to="/goals"
              className="primary-btn"
            >
              Manage goals
              <TrendingUp size={16} />
            </Link>

          </section>

        </>
      )}

    </div>
  );
}


/* =========================================
   SNAPSHOT CARD
========================================= */

function SnapshotCard({
  label,
  value,
  type,
}) {
  return (
    <div className="card insights-snapshot-card">

      <span>
        {label}
      </span>

      <strong className={`snapshot-${type}`}>
        {value}
      </strong>

    </div>
  );
}


/* =========================================
   INSIGHT CARD
========================================= */

function InsightCard({
  insight,
}) {
  const type =
    insight?.type || "default";

  return (
    <div className="insight-page-item">

      <div
        className={`insight-page-icon ${getInsightClass(
          type
        )}`}
      >
        {getInsightIcon(type)}
      </div>

      <div className="insight-page-content">

        <div className="insight-page-title">

          <strong>
            {insight?.title ||
              "Financial insight"}
          </strong>

          <span>
            {capitalize(type)}
          </span>

        </div>

        <p>
          {insight?.message || ""}
        </p>

      </div>

    </div>
  );
}


/* =========================================
   MONEY
========================================= */

function money(value) {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}


/* =========================================
   INSIGHT CLASS
========================================= */

function getInsightClass(type) {
  switch (type) {
    case "saving":
      return "insight-saving";

    case "spending":
      return "insight-spending";

    case "category":
      return "insight-category";

    case "health":
      return "insight-health";

    case "goal":
      return "insight-goal";

    default:
      return "insight-default";
  }
}


/* =========================================
   INSIGHT ICON
========================================= */

function getInsightIcon(type) {
  switch (type) {
    case "saving":
      return "✓";

    case "spending":
      return "↗";

    case "category":
      return "₹";

    case "health":
      return "♥";

    case "goal":
      return "🎯";

    default:
      return "💡";
  }
}


/* =========================================
   CAPITALIZE
========================================= */

function capitalize(value) {
  if (!value) return "";

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}


/* =========================================
   LOADER
========================================= */

function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner size={30} />
      <span>
        Loading financial insights…
      </span>
    </div>
  );
}