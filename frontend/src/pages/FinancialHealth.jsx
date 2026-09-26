import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  HeartPulse,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import api, { apiMessage } from "../lib/api";
import Spinner from "../components/ui/Spinner";

export default function FinancialHealth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/financial-health/")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        setError(
          apiMessage(
            error,
            "Unable to load financial health."
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

  const score = Number(
    data?.financial_health_score || 0
  );

  const health = data?.financial_health || "Unknown";

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
            AI Analytics
          </span>

          <h1>
            Financial Health
          </h1>

          <p>
            AI-powered assessment of your
            current financial condition.
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
              Financial health unavailable
            </h3>

            <p>
              {error}
            </p>
          </div>

        </div>
      )}


      {data && (
        <>

          {/* MAIN SCORE */}
          <div className="health-page-grid">

            <section className="card health-score-card">

              <div className="health-page-icon">
                <HeartPulse size={25} />
              </div>

              <span className="health-page-label">
                Financial Health Score
              </span>

              <div className="health-big-score">
                {score.toFixed(1)}
                <span>/100</span>
              </div>

              <div
                className={`health-page-status ${getHealthClass(
                  health
                )}`}
              >
                {health}
              </div>

              <p>
                Your score is calculated from your
                income, expenses, savings, debt
                and financial profile.
              </p>

            </section>


            {/* PROBABILITIES */}
            <section className="card health-probability-card">

              <div className="card-heading">

                <div>
                  <h2>
                    Health classification
                  </h2>

                  <p>
                    Model prediction probabilities.
                  </p>
                </div>

              </div>


              <ProbabilityRow
                label="Good"
                value={data.probabilities?.Good}
                type="good"
              />

              <ProbabilityRow
                label="Average"
                value={data.probabilities?.Average}
                type="average"
              />

              <ProbabilityRow
                label="Poor"
                value={data.probabilities?.Poor}
                type="poor"
              />

            </section>

          </div>


          {/* EXPLANATION */}
          <section className="card health-explanation">

            <div className="health-explanation-icon">
              <ShieldCheck size={22} />
            </div>

            <div>

              <h2>
                What your score means
              </h2>

              <p>
                A higher financial health score
                generally indicates stronger savings
                and better control over expenses and
                debt.
              </p>

            </div>

          </section>


          {/* SCORE LEVELS */}
          <section className="card health-levels">

            <div className="card-heading">

              <div>
                <h2>
                  Score levels
                </h2>

                <p>
                  Understand the financial health
                  classification.
                </p>
              </div>

            </div>


            <div className="health-level-grid">

              <HealthLevel
                title="Good"
                range="70 – 100"
                description="Strong financial position and healthy financial habits."
                type="good"
              />

              <HealthLevel
                title="Average"
                range="40 – 69.99"
                description="Your finances are manageable but there is room for improvement."
                type="average"
              />

              <HealthLevel
                title="Poor"
                range="0 – 39.99"
                description="Your finances may require attention and corrective planning."
                type="poor"
              />

            </div>

          </section>


          {/* ACTION */}
          <section className="card health-action-card">

            <div>

              <h2>
                Improve your financial health
              </h2>

              <p>
                Review your spending, maintain
                your savings goals and keep your
                monthly budget under control.
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
   PROBABILITY ROW
========================================= */

function ProbabilityRow({
  label,
  value,
  type,
}) {
  const percentage =
    Number(value || 0) * 100;

  return (
    <div className="probability-row">

      <div className="probability-header">

        <span>
          {label}
        </span>

        <strong>
          {percentage.toFixed(1)}%
        </strong>

      </div>

      <div className="probability-bar">

        <span
          className={`probability-fill ${type}`}
          style={{
            width: `${Math.min(
              100,
              percentage
            )}%`,
          }}
        />

      </div>

    </div>
  );
}


/* =========================================
   HEALTH LEVEL
========================================= */

function HealthLevel({
  title,
  range,
  description,
  type,
}) {
  return (
    <div
      className={`health-level ${getHealthClass(
        title
      )}`}
    >

      <strong>
        {title}
      </strong>

      <span>
        {range}
      </span>

      <p>
        {description}
      </p>

    </div>
  );
}


/* =========================================
   HEALTH CLASS
========================================= */

function getHealthClass(status) {
  const value =
    String(status || "").toLowerCase();

  if (value === "good") {
    return "health-good";
  }

  if (value === "average") {
    return "health-average";
  }

  return "health-poor";
}


/* =========================================
   LOADER
========================================= */

function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner size={30} />
      <span>
        Loading financial health…
      </span>
    </div>
  );
}