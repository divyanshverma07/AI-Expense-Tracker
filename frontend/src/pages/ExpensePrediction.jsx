import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

import api, { apiMessage } from "../lib/api";
import Spinner from "../components/ui/Spinner";

export default function ExpensePrediction() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/expenses/prediction")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        setError(
          apiMessage(
            error,
            "Unable to load expense forecast."
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
            AI Prediction
          </span>

          <h1>
            Expense Forecast
          </h1>

          <p>
            AI-powered prediction of your upcoming
            monthly expenses.
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
              Forecast unavailable
            </h3>

            <p>
              {error}
            </p>

            <p>
              Add expenses across at least two
              different months to generate an
              expense forecast.
            </p>
          </div>

        </div>
      )}


      {/* RESULT */}
      {data && (
        <>
          <div className="prediction-summary-grid">

            <div className="card prediction-main-card">

              <div className="prediction-icon">
                <TrendingUp size={22} />
              </div>

              <span>
                Forecast for
              </span>

              <h2>
                {formatForecastMonth(
                  data.forecast_month
                )}
              </h2>

              <strong>
                {money(
                  data.predicted_total
                )}
              </strong>

              <p>
                Predicted total expenses
              </p>

            </div>


            <div className="card prediction-info-card">

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


              <div className="prediction-info-row">

                <div>
                  <span>
                    Predicted spending
                  </span>

                  <strong>
                    {money(
                      data.predicted_total
                    )}
                  </strong>
                </div>

              </div>

            </div>

          </div>


          {/* CATEGORY PREDICTIONS */}
          <section className="card prediction-table-card">

            <div className="card-heading">

              <div>
                <h2>
                  Category forecast
                </h2>

                <p>
                  Predicted spending by expense
                  category.
                </p>
              </div>

            </div>


            <div className="prediction-table">

              <div className="prediction-table-header">
                <span>
                  Category
                </span>

                <span>
                  Predicted expense
                </span>
              </div>


              {Array.isArray(
                data.category_predictions
              ) &&
                data.category_predictions.map(
                  (item) => (
                    <div
                      className="prediction-table-row"
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

                    </div>
                  )
                )}

            </div>

          </section>


          {/* EXPLANATION */}
          <section className="card prediction-explanation">

            <h2>
              How this prediction works
            </h2>

            <p>
              The system analyzes your historical
              monthly expenses and uses a machine
              learning regression model to estimate
              your spending for the upcoming month.
            </p>

            <div className="prediction-note">
              More historical monthly data generally
              gives the model more information about
              your spending pattern.
            </div>

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
        Loading expense forecast…
      </span>
    </div>
  );
}