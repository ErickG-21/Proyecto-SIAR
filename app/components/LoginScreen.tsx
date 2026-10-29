"use client";

import { FormEvent, useState } from "react";
import { siarFacade } from "../../lib/facades/siar-facade";
import { useAuth } from "../state/auth-state";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { state, dispatch } = useAuth();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({ type: "LOGIN_STARTED" });
    try {
      dispatch({ type: "LOGIN_SUCCEEDED", user: await siarFacade.login(email, password) });
    } catch (error) {
      dispatch({ type: "LOGIN_FAILED", error: error instanceof Error ? error.message : "No se pudo iniciar sesión." });
    }
  }

  return <main className="login-page">
    <section className="login-brand">
      <div className="brand-mark large">S</div>
      <p className="eyebrow">Sistema Integral de Administración</p>
      <h1>Todo tu restaurante,<br /><span>en un solo lugar.</span></h1>
      <p className="brand-copy">Gestiona pedidos, menú e inventario con claridad para que tu equipo se concentre en lo importante.</p>
      <div className="login-decoration"><span>01</span><i /><span>SIAR</span></div>
    </section>
    <section className="login-card">
      <div className="mobile-logo"><div className="brand-mark">S</div><strong>SIAR</strong></div>
      <p className="eyebrow">Bienvenido de nuevo</p>
      <h2>Iniciar sesión</h2>
      <p className="muted">Ingresa tus datos para acceder al sistema.</p>
      <form onSubmit={handleLogin}>
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <div className="form-options"><label className="check"><input type="checkbox" defaultChecked /> Recordarme</label><a href="#recover">¿Olvidaste tu contraseña?</a></div>
        {state.status === "error" && <p className="error">{state.error}</p>}
        <button className="primary-button" type="submit" disabled={state.status === "loading"}>{state.status === "loading" ? "Validando..." : "Ingresar al sistema"} <span>→</span></button>
      </form>
    </section>
  </main>;
}
