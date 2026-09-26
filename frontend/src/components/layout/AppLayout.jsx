import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Target,
  UserCircle,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/income", label: "Income", icon: Wallet },
  { to: "/budgets", label: "Budgets", icon: CreditCard },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">₹</div>
          <div>
            <strong>SpendWise</strong>
            <span>AI Expense Tracker</span>
          </div>
          <button className="mobile-close icon-btn" onClick={() => setOpen(false)}><X size={19} /></button>
        </div>

        <nav className="nav-list">
          <p className="nav-label">Workspace</p>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <BarChart3 size={18} />
            <div>
              <strong>Track smarter</strong>
              <span>Know where your money goes.</span>
            </div>
          </div>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <button className="mobile-menu icon-btn" onClick={() => setOpen(true)}><Menu size={22} /></button>
          <div className="topbar-title">Personal Finance</div>
          <div className="user-chip">
            <div className="avatar">{(user?.full_name || "U").charAt(0).toUpperCase()}</div>
            <div className="user-chip-text">
              <strong>{user?.full_name || "User"}</strong>
              <span>{user?.email || ""}</span>
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
