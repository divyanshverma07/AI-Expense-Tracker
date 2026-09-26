import React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../lib/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "expense_tracker_token";
const USER_KEY = "expense_tracker_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(token);

  const login = async (email, password) => {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);

    const { data } = await api.post("/users/login", body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);

    try {
      const profile = await api.get("/me");
      localStorage.setItem(USER_KEY, JSON.stringify(profile.data));
      setUser(profile.data);
    } catch {
      setUser(null);
    }

    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/users/", payload);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token) return;
    api.get("/me")
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem(USER_KEY, JSON.stringify(data));
      })
      .catch(() => {});
  }, [token]);

  const value = useMemo(
    () => ({ token, user, isAuthenticated, login, register, logout }),
    [token, user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
