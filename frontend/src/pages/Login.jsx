import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiMessage } from "../lib/api";
import Spinner from "../components/ui/Spinner";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(apiMessage(err, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen title="Welcome back" subtitle="Sign in to see your financial picture at a glance.">
      <form className="auth-form" onSubmit={submit}>
        {error && <div className="alert error">{error}</div>}
        <label className="field">
          <span className="field-label">Email</span>
          <div className="input-with-icon"><Mail size={18} /><input required type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <div className="input-with-icon"><LockKeyhole size={18} /><input required type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        </label>
        <button className="primary-btn full" disabled={loading}>{loading ? <Spinner size={18} /> : <>Sign in <ArrowRight size={17} /></>}</button>
      </form>
      <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
    </AuthScreen>
  );
}

function AuthScreen({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-orb orb-one" />
        <div className="auth-orb orb-two" />
        <div className="auth-art-content">
          <div className="brand auth-brand"><div className="brand-mark">₹</div><div><strong>SpendWise</strong><span>AI Expense Tracker</span></div></div>
          <div className="auth-hero">
            <span className="eyebrow"><Sparkles size={14} /> Smart money management</span>
            <h1>Build better habits with a clearer view of your money.</h1>
            <p>Track expenses, income and budgets in one focused workspace.</p>
          </div>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">Your finances, simplified</span>
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
