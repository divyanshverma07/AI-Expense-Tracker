import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  IndianRupee,
  PiggyBank,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api, { apiMessage } from "../lib/api";

import StatCard from "../components/dashboard/StatCard";
import Spinner from "../components/ui/Spinner";


const palette = [
  "#2563eb",
  "#7c3aed",
  "#0f766e",
  "#ea580c",
  "#db2777",
  "#0891b2",
  "#65a30d",
];


export default function Dashboard() {

  /* =========================
     MAIN DASHBOARD DATA
  ========================= */

  const [data, setData] = useState(null);

  const [expenses, setExpenses] = useState([]);

  const [incomes, setIncomes] = useState([]);

  const [budgets, setBudgets] = useState([]);
  /* =========================
     AI DATA
  ========================= */

  const [health, setHealth] = useState(null);

  const [goals, setGoals] = useState([]);

  const [expensePrediction, setExpensePrediction] =
    useState(null);

  const [budgetPrediction, setBudgetPrediction] =
    useState(null);

  const [insights, setInsights] = useState(null);


  /* =========================
     UI STATE
  ========================= */

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);


  /* =========================
     LOAD ALL DASHBOARD DATA
  ========================= */

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        const results = await Promise.allSettled([
            api.get("/dashboard/"),
            api.get("/expenses/"),
            api.get("/income/"),
            api.get("/budget/"),
            api.get("/financial-health/"),
            api.get("/goals/"),
            api.get("/expenses/prediction"),
            api.get("/budget/prediction"),
            api.get("/financial-insights/"),
          ]);


        const [
          dashboardResult,
          expensesResult,
          incomeResult,
          budgetResult,
          healthResult,
          goalsResult,
          expensePredictionResult,
          budgetPredictionResult,
          insightsResult,
        ] = results;


        /* =========================
           DASHBOARD
        ========================= */

        if (
          dashboardResult.status === "fulfilled"
        ) {

          setData(
            dashboardResult.value.data
          );

        }


        /* =========================
           EXPENSES
        ========================= */

        if (
          expensesResult.status === "fulfilled"
        ) {

          const value =
            expensesResult.value.data;

          setExpenses(
            Array.isArray(value)
              ? value
              : value?.expenses || []
          );

        }


        /* =========================
           INCOME
        ========================= */

        if (
          incomeResult.status === "fulfilled"
        ) {

          const value =
            incomeResult.value.data;

          setIncomes(
            Array.isArray(value)
              ? value
              : value?.incomes || []
          );

        }

        /***************
         * BUDGETS
         ***************/
        if (budgetResult.status === "fulfilled") {
          const value = budgetResult.value.data;

          setBudgets(
            Array.isArray(value)
              ? value
              : value?.budgets || []
          );
        }


        /* =========================
           FINANCIAL HEALTH
        ========================= */

        if (
          healthResult.status === "fulfilled"
        ) {

          setHealth(
            healthResult.value.data
          );

        }


        /* =========================
           GOALS
        ========================= */

        if (
          goalsResult.status === "fulfilled"
        ) {

          const value =
            goalsResult.value.data;

          setGoals(
            Array.isArray(value)
              ? value
              : value?.goals || []
          );

        }


        /* =========================
           EXPENSE PREDICTION
        ========================= */

        if (
  expensePredictionResult.status ===
  "fulfilled"
) {
  const value =
    expensePredictionResult.value.data;

  setExpensePrediction(value);
}


        /* =========================
           BUDGET PREDICTION
        ========================= */

        if (
  budgetPredictionResult.status ===
  "fulfilled"
) {
  const value =
    budgetPredictionResult.value.data;

  setBudgetPrediction(value);
}


        /* =========================
           FINANCIAL INSIGHTS
        ========================= */

        if (
          insightsResult.status ===
          "fulfilled"
        ) {

          setInsights(
            insightsResult.value.data
          );

        }


        /*
         * Only the main dashboard API
         * failure should stop the page.
         */

        if (
          dashboardResult.status ===
          "rejected"
        ) {

          throw dashboardResult.reason;

        }

      } catch (error) {

        setError(
          apiMessage(
            error,
            "Unable to load dashboard."
          )
        );

      } finally {

        setLoading(false);

      }

    };


    loadDashboard();

  }, []);


  /* =========================
     EXPENSE CATEGORY CHART
  ========================= */

  const chartData = useMemo(() => {

    return (
      data?.category_wise_expenses || []
    ).map((item) => ({

      name: item.category,

      value: Number(
        item.amount || 0
      ),

    }));

  }, [data]);


  /* =========================
     MONTHLY INCOME VS EXPENSE
  ========================= */

  const monthlyTrendData = useMemo(() => {

    const months = {};


    /* EXPENSES */

    expenses.forEach((expense) => {

      const date =
        expense.expense_date ||
        expense.date;

      if (!date) return;

      const monthKey =
        getMonthKey(date);

      if (!monthKey) return;


      if (!months[monthKey]) {

        months[monthKey] = {

          month: monthKey,

          income: 0,

          expense: 0,

        };

      }


      months[monthKey].expense +=
        Number(
          expense.amount || 0
        );

    });


    /* INCOME */

    incomes.forEach((income) => {

      const date =
        income.income_date ||
        income.date;

      if (!date) return;

      const monthKey =
        getMonthKey(date);

      if (!monthKey) return;


      if (!months[monthKey]) {

        months[monthKey] = {

          month: monthKey,

          income: 0,

          expense: 0,

        };

      }


      months[monthKey].income +=
        Number(
          income.amount || 0
        );

    });


    return Object.values(months)

      .sort((a, b) =>
        a.month.localeCompare(b.month)
      )

      .map((item) => ({

        ...item,

        label: formatMonth(
          item.month
        ),

      }));

  }, [expenses, incomes]);


  /* =========================
     ACTIVE GOAL
  ========================= */

  const activeGoal = useMemo(() => {

    return goals.find(
      (goal) =>
        goal.status === "Active"
    );

  }, [goals]);


  /* =========================
     GOAL PROGRESS
  ========================= */

  const goalProgress = useMemo(() => {

      if (!activeGoal) return 0;


    const target = Number(
      activeGoal.target_amount || 0
    );

    const current = Number(
      activeGoal.current_amount || 0
    );


    if (target <= 0) return 0;


    return Math.min(
      100,
      (current / target) * 100
    );

  }, [activeGoal]);

  /* =========================
   CURRENT MONTH BUDGET
========================= */

const currentMonthBudgetData = useMemo(() => {
  const now = new Date();

  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Current month budgets only
  const currentBudgets = budgets.filter(
    (budget) =>
      Number(budget.month) === currentMonth &&
      Number(budget.year) === currentYear
  );

  const totalBudget = currentBudgets.reduce(
    (total, budget) =>
      total + Number(budget.monthly_limit || 0),
    0
  );

  // Current month expenses
  const currentExpenses = expenses.filter((expense) => {
    const date =
      expense.expense_date ||
      expense.date;

    if (!date) return false;

    const parsedDate = new Date(date);

    return (
      parsedDate.getMonth() + 1 === currentMonth &&
      parsedDate.getFullYear() === currentYear
    );
  });

  const totalSpent = currentExpenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const remaining = Math.max(
    0,
    totalBudget - totalSpent
  );

  const usagePercentage =
    totalBudget > 0
      ? (totalSpent / totalBudget) * 100
      : 0;

  // Category-wise budget usage
  const categoryData = currentBudgets.map(
    (budget) => {
      const budgetCategory =
        String(budget.category || "")
          .trim()
          .toLowerCase();

      const spent = currentExpenses
        .filter(
          (expense) =>
            String(expense.category || "")
              .trim()
              .toLowerCase() ===
            budgetCategory
        )
        .reduce(
          (total, expense) =>
            total + Number(expense.amount || 0),
          0
        );

      const limit =
        Number(budget.monthly_limit || 0);

      const percentage =
        limit > 0
          ? (spent / limit) * 100
          : 0;

      return {
        category: budget.category,
        limit,
        spent,
        remaining: Math.max(
          0,
          limit - spent
        ),
        percentage,
        overBudget: spent > limit,
      };
    }
  );

  return {
    currentBudgets,
    totalBudget,
    totalSpent,
    remaining,
    usagePercentage,
    categoryData,
    currentMonth,
    currentYear,
  };
}, [budgets, expenses]);


  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return <PageLoader />;

  }


  /* =========================
     ERROR
  ========================= */

  if (error) {

    return (
      <div className="alert error page-alert">

        {error}

      </div>
    );

  }


  const d = data || {};


  /* =========================
     DASHBOARD UI
  ========================= */

  return (

    <div className="page">


      {/* =================================
          PAGE HEADER
      ================================= */}

      <div className="page-heading">

        <div>

          <span className="eyebrow">
            Overview
          </span>

          <h1>
            Good to see you.
          </h1>

          <p>
            Here is your current financial
            snapshot.
          </p>

        </div>


        <Link
          className="primary-btn"
          to="/expenses"
        >

          Add expense

          <ArrowUpRight size={17} />

        </Link>

      </div>


      {/* =================================
          STAT CARDS
      ================================= */}

      <div className="stats-grid">

        <StatCard
          label="Total income"
          value={money(
            d.total_income
          )}
          icon={
            <TrendingUp size={19} />
          }
          tone="green"
          helper={`This month ${money(
            d.monthly_income
          )}`}
        />


        <StatCard
          label="Total expenses"
          value={money(
            d.total_expenses
          )}
          icon={
            <TrendingDown size={19} />
          }
          tone="red"
          helper={`This month ${money(
            d.monthly_expenses
          )}`}
        />


        <StatCard
          label="Total savings"
          value={money(
            d.total_savings
          )}
          icon={
            <PiggyBank size={19} />
          }
          tone="blue"
          helper="Income minus expenses"
        />


        <StatCard
          label="Budget used"
          value={`${Number(
            d.budget_usage_percentage ||
              0
          ).toFixed(0)}%`}
          icon={
            <IndianRupee size={19} />
          }
          tone="purple"
          helper={`${money(
            d.budget_used
          )} of ${money(
            d.monthly_budget
          )}`}
        />

      </div>


      {/* =================================
          CHARTS
      ================================= */}

      <div className="dashboard-grid dashboard-chart-grid">


        {/* =================================
            INCOME VS EXPENSE
        ================================= */}

        <section className="card chart-card income-expense-card">

          <div className="card-heading">

            <div>

              <h2>
                Income vs expenses
              </h2>

              <p>
                Monthly comparison of your
                income and spending.
              </p>

            </div>

          </div>


          {monthlyTrendData.length > 0 ? (

            <div className="line-chart-wrap">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <LineChart
                  data={monthlyTrendData}
                  margin={{
                    top: 15,
                    right: 20,
                    left: 5,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e8edf4"
                  />


                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 11,
                      fill: "#7c899d",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />


                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "#7c899d",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={
                      (value) =>
                        formatChartAmount(
                          value
                        )
                    }
                  />


                  <Tooltip
                    formatter={(
                      value,
                      name
                    ) => [

                      money(value),

                      name === "Income"
                        ? "Income"
                        : "Expenses",

                    ]}
                    labelStyle={{
                      color: "#172033",
                      fontWeight: 700,
                    }}
                    contentStyle={{
                      borderRadius: 10,
                      border:
                        "1px solid #e7ebf2",
                      boxShadow:
                        "0 8px 25px rgba(20, 30, 50, 0.08)",
                    }}
                  />


                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />


                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Expenses"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <div className="empty-state compact">

              <div className="empty-icon">
                ₹
              </div>

              <h3>
                No monthly data yet
              </h3>

              <p>
                Add income and expenses
                to see your financial
                trend.
              </p>

            </div>

          )}


          {monthlyTrendData.length > 0 && (

            <div className="chart-legend">

              <div>

                <span
                  className="chart-legend-dot"
                  style={{
                    background:
                      "#10b981",
                  }}
                />

                <span>
                  Income
                </span>

              </div>


              <div>

                <span
                  className="chart-legend-dot"
                  style={{
                    background:
                      "#ef4444",
                  }}
                />

                <span>
                  Expenses
                </span>

              </div>

            </div>

          )}

        </section>


        {/* =================================
            EXPENSE BREAKDOWN
        ================================= */}

        <section className="card chart-card">

          <div className="card-heading">

            <div>

              <h2>
                Spending by category
              </h2>

              <p>
                Where your expenses
                are going.
              </p>

            </div>

          </div>


          {chartData.length ? (

            <div className="donut-wrap">

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={82}
                    outerRadius={115}
                    paddingAngle={3}
                  >

                    {chartData.map(
                      (_, index) => (

                        <Cell
                          key={index}
                          fill={
                            palette[
                              index %
                                palette.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>


                  <Tooltip
                    formatter={(value) =>
                      money(value)
                    }
                  />

                </PieChart>

              </ResponsiveContainer>


              <div className="legend">

                {chartData.map(
                  (item, index) => (

                    <div
                      className="legend-row"
                      key={item.name}
                    >

                      <span
                        className="legend-dot"
                        style={{
                          background:
                            palette[
                              index %
                                palette.length
                            ],
                        }}
                      />

                      <span>
                        {item.name}
                      </span>

                      <strong>
                        {money(
                          item.value
                        )}
                      </strong>

                    </div>

                  )
                )}

              </div>

            </div>

          ) : (

            <div className="empty-state compact">

              <div className="empty-icon">
                ₹
              </div>

              <h3>
                No expense data yet
              </h3>

              <p>
                Add expenses to see
                your category breakdown.
              </p>

            </div>

          )}

        </section>

      </div>


      {/* =================================
          BUDGET + FINANCIAL SUMMARY
      ================================= */}

      <div className="dashboard-grid dashboard-bottom-grid">


        {/* MONTHLY BUDGET */}

        <section className="card budget-card">

  <div className="card-heading">
    <div>
      <h2>Monthly budget</h2>

      <p>
        {monthName(
          currentMonthBudgetData.currentMonth
        )}{" "}
        {currentMonthBudgetData.currentYear}
      </p>
    </div>

    <Link
      to="/budgets"
      className="text-btn"
    >
      Manage
    </Link>
  </div>

  {/* BUDGET SUMMARY */}

  <div className="budget-numbers">

    <div>
      <span>Budget</span>

      <strong>
        {money(
          currentMonthBudgetData.totalBudget
        )}
      </strong>
    </div>

    <div>
      <span>Spent</span>

      <strong>
        {money(
          currentMonthBudgetData.totalSpent
        )}
      </strong>
    </div>

    <div>
      <span>Remaining</span>

      <strong>
        {money(
          currentMonthBudgetData.remaining
        )}
      </strong>
    </div>

  </div>

  {/* USAGE */}

  <div
    style={{
      marginTop: "18px",
      marginBottom: "8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <span
      style={{
        fontSize: "13px",
        color: "#7c899d",
      }}
    >
      Budget used
    </span>

    <strong
      style={{
        fontSize: "14px",
      }}
    >
      {currentMonthBudgetData.usagePercentage.toFixed(
        1
      )}
      %
    </strong>
  </div>

  <div className="progress">
    <span
      style={{
        width: `${Math.min(
          100,
          currentMonthBudgetData.usagePercentage
        )}%`,
      }}
    />
  </div>

  {/* CATEGORY BUDGETS */}

  <div
    style={{
      marginTop: "22px",
    }}
  >

    <h3
      style={{
        marginBottom: "14px",
        fontSize: "15px",
      }}
    >
      Category budgets
    </h3>

    {currentMonthBudgetData.categoryData.length >
    0 ? (

      currentMonthBudgetData.categoryData.map(
        (item) => (
          <div
            key={item.category}
            style={{
              marginBottom: "16px",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >

              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {formatCategoryName(
                  item.category
                )}
              </span>

              <span
                style={{
                  fontSize: "12px",
                  color: item.overBudget
                    ? "#dc2626"
                    : "#7c899d",
                  fontWeight: 600,
                }}
              >
                {money(item.spent)} /{" "}
                {money(item.limit)}
              </span>

            </div>

            <div className="progress">

              <span
                style={{
                  width: `${Math.min(
                    100,
                    item.percentage
                  )}%`,
                  background:
                    item.overBudget
                      ? "#ef4444"
                      : undefined,
                }}
              />

            </div>

            <div
              style={{
                marginTop: "5px",
                display: "flex",
                justifyContent:
                  "space-between",
                fontSize: "11px",
                color: item.overBudget
                  ? "#dc2626"
                  : "#7c899d",
              }}
            >

              <span>
                {item.overBudget
                  ? "Over budget"
                  : `${item.percentage.toFixed(
                      1
                    )}% used`}
              </span>

              <span>
                {item.overBudget
                  ? `${money(
                      Math.abs(
                        item.remaining
                      )
                    )} over`
                  : `${money(
                      item.remaining
                    )} left`}
              </span>

            </div>

          </div>
        )
      )

    ) : (

      <div className="empty-state compact">

        <div className="empty-icon">
          ₹
        </div>

        <h3>
          No budget set
        </h3>

        <p>
          Create a monthly budget to track
          your spending.
        </p>

        <Link
          to="/budgets"
          className="text-btn"
        >
          Create budget
        </Link>

      </div>

    )}

  </div>

</section>


        {/* FINANCIAL SUMMARY */}

        <section className="card financial-summary-card">

          <div className="card-heading">

            <div>

              <h2>
                Financial summary
              </h2>

              <p>
                Your current monthly
                position.
              </p>

            </div>

          </div>


          <div className="summary-list">

            <SummaryRow
              label="Monthly income"
              value={money(
                d.monthly_income
              )}
              type="positive"
            />


            <SummaryRow
              label="Monthly expenses"
              value={money(
                d.monthly_expenses
              )}
              type="negative"
            />


            <SummaryRow
              label="Monthly savings"
              value={money(
                Number(
                  d.monthly_income ||
                    0
                ) -
                  Number(
                    d.monthly_expenses ||
                      0
                  )
              )}
              type="positive"
            />


            <SummaryRow
              label="Savings rate"
              value={`${calculateSavingsRate(
                d.monthly_income,
                d.monthly_expenses
              ).toFixed(1)}%`}
              type="positive"
            />

          </div>

        </section>

      </div>


      {/* =================================
          AI FINANCIAL OVERVIEW
      ================================= */}

      <div className="ai-section">


        {/* SECTION HEADING */}

        <div className="section-heading">

          <div>

            <span className="eyebrow">
              AI Analytics
            </span>

            <h2>
              Your financial intelligence
            </h2>

            <p>
              AI-powered insights based
              on your financial activity.
            </p>

          </div>

        </div>


        {/* AI GRID */}

        <div className="ai-grid">


          {/* =================================
              FINANCIAL HEALTH
          ================================= */}

          <section className="card ai-card health-card">

            <div className="ai-card-header">

              <div>

                <h2>
                  Financial health
                </h2>

                <p>
                  AI assessment of your
                  financial position.
                </p>

              </div>

              <Link
                to="/financial-health"
                className="text-btn"
              >
                View details
              </Link>

            </div>


            {health ? (

              <div className="health-content">

                <div className="health-score">

                  <strong>

                    {Number(
                      health.financial_health_score ||
                        0
                    ).toFixed(1)}

                  </strong>

                  <span>
                    / 100
                  </span>

                </div>


                <div
                  className={`health-status ${getHealthClass(
                    health.financial_health
                  )}`}
                >

                  {health.financial_health ||
                    "Unknown"}

                </div>


                <p className="health-message">

                  Your current financial
                  health is based on income,
                  expenses, savings and
                  financial profile information.

                </p>

              </div>

            ) : (

              <div className="ai-unavailable">

                Financial health data is
                not available yet.

              </div>

            )}

          </section>


          {/* =================================
              GOAL PROGRESS
          ================================= */}

          <section className="card ai-card">

            <div className="ai-card-header">

              <div>

                <h2>
                  Goal progress
                </h2>

                <p>
                  Keep moving toward your
                  financial target.
                </p>

              </div>

              <Link
                to="/goals"
                className="text-btn"
              >
                View goals
              </Link>

            </div>


            {activeGoal ? (

              <div className="goal-dashboard-content">


                <div className="goal-dashboard-title">

                  <div className="goal-dashboard-icon">
                    🎯
                  </div>


                  <div>

                    <strong>
                      {activeGoal.goal_name}
                    </strong>

                    <span>

                      {money(
                        activeGoal.current_amount
                      )}

                      {" "}of{" "}

                      {money(
                        activeGoal.target_amount
                      )}

                    </span>

                  </div>

                </div>


                <div className="goal-dashboard-progress-header">

                  <span>
                    Progress
                  </span>

                  <strong>
                    {goalProgress.toFixed(0)}%
                  </strong>

                </div>


                <div className="progress">

                  <span
                    style={{
                      width: `${goalProgress}%`,
                    }}
                  />

                </div>


                <div className="goal-dashboard-footer">

                  <span>
                    Target date
                  </span>

                  <strong>

                    {formatMonthDay(
                      activeGoal.target_date
                    )}

                  </strong>

                </div>

              </div>

            ) : (

              <div className="ai-unavailable">

                No active financial goal yet.

                <Link
                  to="/goals"
                  className="text-btn"
                >
                  Create a goal
                </Link>

              </div>

            )}

          </section>


          {/* =================================
              EXPENSE FORECAST
          ================================= */}

          <section className="card ai-card">

            <div className="ai-card-header">

              <div>

                <h2>
                  Expense forecast
                </h2>

                <p>
                  Predicted expenses for
                  your next month.
                </p>

              </div>

              <Link
                to="/expense-prediction"
                className="text-btn"
              >
                Details
              </Link>

            </div>


            {expensePrediction ? (

              <div className="prediction-content">

                <span className="prediction-label">
                  Forecast for
                </span>


                <strong className="prediction-month">

                  {formatForecastMonth(
                    expensePrediction.forecast_month
                  )}

                </strong>


                <div className="prediction-amount">

                  {money(
                    expensePrediction.predicted_total
                  )}

                </div>


                <span className="prediction-description">
                  predicted total expenses
                </span>


                {Array.isArray(
  expensePrediction.category_predictions
) &&
  expensePrediction.category_predictions
    .slice(0, 3)
    .map((item) => (
      <div
        className="prediction-row"
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
    ))}

              </div>

            ) : (

              <div className="ai-unavailable">

                At least two months of
                expense history are required
                for forecasting.

              </div>

            )}

          </section>


          {/* =================================
              BUDGET PREDICTION
          ================================= */}

          <section className="card ai-card">

            <div className="ai-card-header">

              <div>

                <h2>
                  Budget prediction
                </h2>

                <p>
                  AI-recommended budget
                  for next month.
                </p>

              </div>

              <Link
                to="/budget-prediction"
                className="text-btn"
              >
                Details
              </Link>

            </div>


            {budgetPrediction ? (

              <div className="prediction-content">

                <span className="prediction-label">
                  Recommended budget
                </span>


                <div className="prediction-amount">

                  {money(
                    budgetPrediction
                      .recommended_total_budget
                  )}

                </div>


                <span className="prediction-description">

                  for{" "}

                  {formatForecastMonth(
                    budgetPrediction.forecast_month
                  )}

                </span>


                <div className="prediction-highlight">

                  <span>
                    Predicted spending
                  </span>

                  <strong>

                    {money(
                      budgetPrediction
                        .predicted_total
                    )}

                  </strong>

                </div>

              </div>

            ) : (

              <div className="ai-unavailable">

                At least two months of
                expense history are required
                for budget prediction.

              </div>

            )}

          </section>

        </div>


        {/* =================================
            FINANCIAL INSIGHTS
        ================================= */}

        {insights?.insights?.length > 0 && (

          <section className="card insights-card">


            <div className="ai-card-header">

              <div>

                <h2>
                  AI financial insights
                </h2>

                <p>
                  Personalized observations
                  from your financial activity.
                </p>

              </div>


              <Link
                to="/financial-insights"
                className="text-btn"
              >
                View all
              </Link>

            </div>


            <div className="insights-grid">

              {insights.insights
                .slice(0, 4)
                .map(
                  (insight, index) => (

                    <div
                      className="insight-item"
                      key={`${insight.title}-${index}`}
                    >

                      <div
                        className={`insight-icon ${getInsightClass(
                          insight.type
                        )}`}
                      >

                        {getInsightIcon(
                          insight.type
                        )}

                      </div>


                      <div>

                        <strong>
                          {insight.title}
                        </strong>

                        <p>
                          {insight.message}
                        </p>

                      </div>

                    </div>

                  )
                )}

            </div>


            {insights.recommendation && (

              <div className="recommendation-box">

                <span>
                  AI recommendation
                </span>

                <p>
                  {insights.recommendation}
                </p>

              </div>

            )}

          </section>

        )}

      </div>

    </div>

  );

}


/* =====================================================
   HELPER FUNCTIONS
===================================================== */


/* MONEY */

function money(value) {

  return `₹${Number(
    value || 0
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;

}


/* CHART AMOUNT */

function formatChartAmount(value) {

  const number =
    Number(value || 0);


  if (number >= 100000) {

    return `₹${(
      number / 100000
    ).toFixed(1)}L`;

  }


  if (number >= 1000) {

    return `₹${(
      number / 1000
    ).toFixed(0)}K`;

  }


  return `₹${number}`;

}


/* MONTH KEY */

function getMonthKey(date) {

  const parsed =
    new Date(date);


  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {

    return null;

  }


  const year =
    parsed.getFullYear();


  const month =
    String(
      parsed.getMonth() + 1
    ).padStart(2, "0");


  return `${year}-${month}`;

}


/* MONTH LABEL */

function formatMonth(monthKey) {

  const [
    year,
    month,
  ] = monthKey.split("-");


  const date =
    new Date(
      Number(year),
      Number(month) - 1,
      1
    );


  return date.toLocaleDateString(
    "en-IN",
    {
      month: "short",
      year: "numeric",
    }
  );

}


/* SAVINGS RATE */

function calculateSavingsRate(
  income,
  expenses
) {

  const totalIncome =
    Number(income || 0);


  const totalExpenses =
    Number(expenses || 0);


  if (
    totalIncome <= 0
  ) {

    return 0;

  }


  return (
    (
      (
        totalIncome -
        totalExpenses
      ) /
      totalIncome
    ) *
    100
  );

}


/* SUMMARY ROW */

function SummaryRow({
  label,
  value,
  type,
}) {

  return (

    <div className="summary-row">

      <span>
        {label}
      </span>

      <strong
        className={`summary-value ${type}`}
      >
        {value}
      </strong>

    </div>

  );

}


/* HEALTH CLASS */

function getHealthClass(
  status
) {

  const value =
    String(
      status || ""
    ).toLowerCase();


  if (
    value === "good"
  ) {

    return "health-good";

  }


  if (
    value === "average"
  ) {

    return "health-average";

  }


  return "health-poor";

}


/* FORECAST MONTH */

function formatForecastMonth(
  value
) {

  if (!value) {

    return "Next month";

  }


  const [
    year,
    month,
  ] =
    String(value).split("-");


  if (
    !year ||
    !month
  ) {

    return value;

  }


  const date =
    new Date(
      Number(year),
      Number(month) - 1,
      1
    );


  return date.toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );

}


/* GOAL DATE */

function formatMonthDay(
  value
) {

  if (!value) {

    return "—";

  }


  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

}


/* INSIGHT CLASS */

function getInsightClass(
  type
) {

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


/* INSIGHT ICON */

function getInsightIcon(
  type
) {

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


/* PAGE LOADER */

function PageLoader() {

  return (

    <div className="page-loader">

      <Spinner size={30} />

      <span>
        Loading dashboard…
      </span>

    </div>

  );

}

function formatCategoryName(category) {
  if (!category) {
    return "Miscellaneous";
  }

  return String(category)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
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