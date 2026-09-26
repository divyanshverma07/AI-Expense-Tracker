import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiMessage } from "../lib/api";
import Spinner from "../components/ui/Spinner";
import Login from "./Login";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (err) {
      setError(apiMessage(err, "Could not create the account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-orb orb-one" /><div className="auth-orb orb-two" />
        <div className="auth-art-content">
          <div className="brand auth-brand"><div className="brand-mark">₹</div><div><strong>SpendWise</strong><span>AI Expense Tracker</span></div></div>
          <div className="auth-hero"><span className="eyebrow">Start today</span><h1>Make every rupee easier to understand.</h1><p>Create your account and take control of your spending.</p></div>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">Create your workspace</span>
          <h2>Get started</h2>
          <p className="auth-subtitle">A few details and you are ready to track.</p>
          <form className="auth-form" onSubmit={submit}>
            {error && <div className="alert error">{error}</div>}
            <label className="field"><span className="field-label">Full name</span><div className="input-with-icon"><UserRound size={18}/><input required minLength="2" placeholder="Your name" value={form.full_name} onChange={(e)=>setForm({...form, full_name:e.target.value})}/></div></label>
            <label className="field"><span className="field-label">Email</span><div className="input-with-icon"><Mail size={18}/><input required type="email" placeholder="you@example.com" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})}/></div></label>
            <label className="field"><span className="field-label">Password</span><div className="input-with-icon"><LockKeyhole size={18}/><input required minLength="6" type="password" placeholder="At least 6 characters" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})}/></div></label>
            <button className="primary-btn full" disabled={loading}>{loading ? <Spinner size={18}/> : <>Create account <ArrowRight size={17}/></>}</button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
