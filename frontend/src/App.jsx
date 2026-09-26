import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";


import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import ExpensePrediction from "./pages/ExpensePrediction";
import BudgetPrediction from "./pages/BudgetPrediction";
import FinancialHealth from "./pages/FinancialHealth";
import FinancialInsights from "./pages/FinancialInsights";
import NotFound from "./pages/NotFound";


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            index
            element={<Navigate to="/dashboard" replace />}
          />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/income" element={<Income />} />
          <Route path="/budgets" element={<Budgets />} />

          {/* Financial Goals */}
          <Route path="/goals" element={<Goals />} />
          <Route
  path="/expense-prediction"
  element={<ExpensePrediction />}
/>

<Route
  path="/budget-prediction"
  element={<BudgetPrediction />}
/>
<Route
  path="/financial-health"
  element={<FinancialHealth />}
/>

<Route
  path="/financial-insights"
  element={<FinancialInsights />}
/>

          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}