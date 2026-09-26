import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Wallet,
} from "lucide-react";

import api, { apiMessage } from "../lib/api";
import Spinner from "../components/ui/Spinner";

export default function BudgetPrediction() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/budget/prediction")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        setError(
          apiMessage(
            error,
            "Unable to load budget prediction."
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
            AI Planning
          </span>

          <h1>
            Budget Prediction
          </h1>

          <p>
            AI-generated spending forecast and
            recommended budget for next month.
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
              Budget prediction unavailable
            </h3>

            <p>
              {error}
            </p>

            <p>
              Add expenses across at least two
              different months to generate a
              budget recommendation.
            </p>

          </div>

        </div>
      )}


      {/* RESULT */}
      {data && (
        <>

          <div className="prediction-summary-grid">

            {/* RECOMMENDED BUDGET */}

            <div className="card prediction-main-card">

              <div className="prediction-icon">
                <Wallet size={22} />
              </div>

              <span>
                Recommended budget
              </span>

              <h2>
                {formatForecastMonth(
                  data.forecast_month
                )}
              </h2>

              <strong>
                {money(
                  data.recommended_total_budget
                )}
              </strong>

              <p>
                Recommended spending limit
              </p>

            </div>


            {/* PREDICTED SPENDING */}

            <div className="card prediction-info-card">

              <div className="prediction-info-row">

                <div>

                  <span>
                    Predicted expenses
                  </span>

                  <strong>
                    {money(
                      data.predicted_total
                    )}
                  </strong>

                </div>

              </div>


              <div className="prediction-info-row">

                <div>

                  <span>
                    Recommended buffer
                  </span>

                  <strong>
                    {money(
                      Number(
                        data.recommended_total_budget ||
                          0
                      ) -
                        Number(
                          data.predicted_total ||
                            0
                        )
                    )}
                  </strong>

                </div>

              </div>


              <div className="prediction-info-row">

                <div>

                  <span>
                    Historical months
                  </span>

                  <strong>
                    {data.historical_months}
                  </strong>

                </div>

                <CalendarDays size={20} />

              </div>

            </div>

          </div>


          {/* CATEGORY BUDGET */}

          <section className="card prediction-table-card">

            <div className="card-heading">

              <div>

                <h2>
                  Recommended category budgets
                </h2>

                <p>
                  Suggested limits based on your
                  predicted spending.
                </p>

              </div>

            </div>


            <div className="prediction-table">

              <div className="prediction-table-header">

                <span>
                  Category
                </span>

                <span>
                  Predicted
                </span>

                <span>
                  Recommended budget
                </span>

              </div>


              {Array.isArray(
                data.category_predictions
              ) &&
                data.category_predictions.map(
                  (item) => (

                    <div
                      className="prediction-table-row budget-row"
                      key={item.category}
                    >

                      <span>
                        {item.category}
                      </span>

                      <strong>
                        {money(
                          item.predicted_expense
                        )}
                      </strong>

                      <strong className="recommended-value">
                        {money(
                          item.recommended_budget
                        )}
                      </strong>

                    </div>

                  )
                )}

            </div>

          </section>


          {/* EXPLANATION */}

          <section className="card prediction-explanation">

            <h2>
              How the budget is calculated
            </h2>

            <p>
              The system first predicts your
              upcoming expenses by category using
              historical monthly spending.
            </p>

            <p>
              A small planning buffer is then added
              to the predicted spending to create a
              recommended budget.
            </p>

          </section>

        </>
      )}

    </div>
  );
}


/* =========================
   HELPERS
========================= */

function money(value) {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}


function formatForecastMonth(value) {
  if (!value) return "Next month";

  const [year, month] =
    String(value).split("-");

  if (!year || !month) {
    return value;
  }

  return new Date(
    Number(year),
    Number(month) - 1,
    1
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}


function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner size={30} />
      <span>
        Loading budget prediction…
      </span>
    </div>
  );
}