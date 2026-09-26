import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";

import api, { apiMessage } from "../lib/api";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";
import Field from "../components/forms/Field";

const emptyForm = {
  goal_name: "",
  target_amount: "",
  current_amount: "0",
  target_date: "",
  priority: "Medium",
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [planOpen, setPlanOpen] = useState(false);
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  const loadGoals = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/goals/");
      setGoals(response.data);
    } catch (err) {
      setError(apiMessage(err, "Unable to load goals."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setOpen(true);
  };

  const openEdit = (goal) => {
    setEditing(goal);

    setForm({
      goal_name: goal.goal_name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      target_date: goal.target_date,
      priority: goal.priority,
    });

    setError("");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        target_amount: Number(form.target_amount),
        current_amount: Number(form.current_amount),
      };

      if (editing) {
        const response = await api.put(
          `/goals/${editing.goal_id}`,
          payload
        );

        setGoals(
          goals.map((goal) =>
            goal.goal_id === editing.goal_id ? response.data : goal
          )
        );
      } else {
        const response = await api.post("/goals/", payload);

        setGoals([response.data, ...goals]);
      }

      closeModal();
    } catch (err) {
      setError(apiMessage(err, "Unable to save goal."));
    } finally {
      setSaving(false);
    }
  };

  const removeGoal = async (goalId) => {
    if (!window.confirm("Delete this financial goal?")) return;

    try {
      await api.delete(`/goals/${goalId}`);

      setGoals(goals.filter((goal) => goal.goal_id !== goalId));
    } catch (err) {
      setError(apiMessage(err, "Unable to delete goal."));
    }
  };

  const viewPlan = async (goalId) => {
    setPlanOpen(true);
    setPlan(null);
    setPlanLoading(true);
    setError("");

    try {
      const response = await api.get(`/goals/${goalId}/plan`);
      setPlan(response.data);
    } catch (err) {
      setError(apiMessage(err, "Unable to calculate goal plan."));
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Financial Planning</span>

          <h1>Goals</h1>

          <p>
            Set, track and achieve your financial targets.
          </p>
        </div>

        <button className="primary-btn" onClick={openCreate}>
          <Plus size={17} />
          Add goal
        </button>
      </div>

      {error && (
        <div className="alert error page-alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="page-loader">
          <Spinner size={30} />
          <span>Loading goals...</span>
        </div>
      ) : goals.length === 0 ? (
        <section className="card">
          <EmptyState
            title="No financial goals yet"
            text="Create your first goal and start planning your savings."
          />

          <div className="goal-empty-action">
            <button className="primary-btn" onClick={openCreate}>
              <Plus size={17} />
              Create your first goal
            </button>
          </div>
        </section>
      ) : (
        <div className="goals-grid">
          {goals.map((goal) => {
            const target = Number(goal.target_amount || 0);
            const current = Number(goal.current_amount || 0);

            const progress =
              target > 0
                ? Math.min(100, (current / target) * 100)
                : 0;

            const remaining = Math.max(target - current, 0);

            const completed =
              goal.status === "Completed" || progress >= 100;

            return (
              <section className="card goal-card" key={goal.goal_id}>
                <div className="goal-card-top">
                  <div className="goal-title-wrap">
                    <div className="goal-icon">
                      <Target size={18} />
                    </div>

                    <div>
                      <h2>{goal.goal_name}</h2>

                      <span className="goal-priority">
                        {goal.priority} Priority
                      </span>
                    </div>
                  </div>

                  <span
                    className={`goal-status ${
                      completed ? "completed" : "active"
                    }`}
                  >
                    {completed ? "Completed" : goal.status}
                  </span>
                </div>

                <div className="goal-amounts">
                  <div>
                    <span>Saved</span>
                    <strong>{money(current)}</strong>
                  </div>

                  <div className="goal-target">
                    <span>Target</span>
                    <strong>{money(target)}</strong>
                  </div>
                </div>

                <div className="goal-progress-header">
                  <span>Progress</span>
                  <strong>{progress.toFixed(0)}%</strong>
                </div>

                <div className="progress goal-progress">
                  <span
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <div className="goal-meta">
                  <div>
                    <span>
                      <CalendarDays size={14} />
                      Target date
                    </span>

                    <strong>{formatDate(goal.target_date)}</strong>
                  </div>

                  <div>
                    <span>
                      <TrendingUp size={14} />
                      Remaining
                    </span>

                    <strong>{money(remaining)}</strong>
                  </div>
                </div>

                <div className="goal-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => viewPlan(goal.goal_id)}
                  >
                    <TrendingUp size={16} />
                    View plan
                  </button>

                  <button
                    className="icon-btn"
                    title="Edit goal"
                    onClick={() => openEdit(goal)}
                  >
                    <Edit3 size={16} />
                  </button>

                  <button
                    className="icon-btn danger"
                    title="Delete goal"
                    onClick={() => removeGoal(goal.goal_id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Add / Edit Goal */}
      <Modal
        open={open}
        onClose={closeModal}
        title={editing ? "Edit goal" : "Create financial goal"}
      >
        <form className="modal-form" onSubmit={handleSubmit}>
          <Field label="Goal name">
            <input
              required
              value={form.goal_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  goal_name: e.target.value,
                })
              }
              placeholder="Buy Laptop, Emergency Fund..."
            />
          </Field>

          <div className="form-grid">
            <Field label="Target amount">
              <input
                required
                min="0.01"
                step="0.01"
                type="number"
                value={form.target_amount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    target_amount: e.target.value,
                  })
                }
                placeholder="80000"
              />
            </Field>

            <Field label="Current saved amount">
              <input
                min="0"
                step="0.01"
                type="number"
                value={form.current_amount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    current_amount: e.target.value,
                  })
                }
                placeholder="20000"
              />
            </Field>
          </div>

          <div className="form-grid">
            <Field label="Target date">
              <input
                required
                type="date"
                value={form.target_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    target_date: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority: e.target.value,
                  })
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </Field>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={closeModal}
            >
              Cancel
            </button>

            <button
              className="primary-btn"
              disabled={saving}
            >
              {saving ? (
                <Spinner size={17} />
              ) : editing ? (
                "Save changes"
              ) : (
                "Create goal"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Goal Plan */}
      <Modal
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        title="Goal savings plan"
      >
        {planLoading ? (
          <div className="page-loader">
            <Spinner size={28} />
            <span>Calculating your plan...</span>
          </div>
        ) : plan ? (
          <div className="goal-plan">
            <div className="goal-plan-header">
              <div className="goal-icon">
                <Target size={20} />
              </div>

              <div>
                <h2>{plan.goal_name}</h2>
                <p>{plan.status}</p>
              </div>
            </div>

            <div className="goal-plan-grid">
              <div>
                <span>Target</span>
                <strong>{money(plan.target_amount)}</strong>
              </div>

              <div>
                <span>Current savings</span>
                <strong>{money(plan.current_amount)}</strong>
              </div>

              <div>
                <span>Remaining</span>
                <strong>{money(plan.remaining_amount)}</strong>
              </div>

              <div>
                <span>Months remaining</span>
                <strong>{plan.months_remaining}</strong>
              </div>

              <div>
                <span>Required / month</span>
                <strong>{money(plan.required_monthly_saving)}</strong>
              </div>

              <div>
                <span>Estimated / month</span>
                <strong>{money(plan.estimated_monthly_saving)}</strong>
              </div>
            </div>

            <div
              className={`goal-feasibility ${
                plan.feasible ? "success" : "warning"
              }`}
            >
              {plan.feasible ? (
                <CheckCircle2 size={19} />
              ) : (
                <XCircle size={19} />
              )}

              <div>
                <strong>
                  {plan.feasible
                    ? "Goal is achievable"
                    : "Goal may be difficult to achieve"}
                </strong>

                <p>
                  {plan.feasible
                    ? "Your estimated monthly saving capacity is enough to reach this goal."
                    : "Consider increasing your monthly savings or extending the target date."}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}