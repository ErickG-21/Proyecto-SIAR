"use client";

import { createContext, Dispatch, ReactNode, useContext, useReducer } from "react";
import type { LoginUser } from "../../lib/facades/siar-facade";

export type AuthState =
  | { status: "idle"; user: null; error: null }
  | { status: "loading"; user: null; error: null }
  | { status: "authenticated"; user: LoginUser; error: null }
  | { status: "error"; user: null; error: string };

type AuthAction =
  | { type: "LOGIN_STARTED" }
  | { type: "LOGIN_SUCCEEDED"; user: LoginUser }
  | { type: "LOGIN_FAILED"; error: string }
  | { type: "LOGOUT" };

const initialState: AuthState = { status: "idle", user: null, error: null };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_STARTED":
      return { status: "loading", user: null, error: null };
    case "LOGIN_SUCCEEDED":
      return { status: "authenticated", user: action.user, error: null };
    case "LOGIN_FAILED":
      return { status: "error", user: null, error: action.error };
    case "LOGOUT":
      return initialState;
  }
}

const AuthContext = createContext<{ state: AuthState; dispatch: Dispatch<AuthAction> } | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  return context;
}
