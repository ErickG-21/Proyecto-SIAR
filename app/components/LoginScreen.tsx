"use client";

import { FormEvent, useState } from "react";

export type AuthenticatedUser = { id: string; name: string; role: string };

export function LoginScreen({ onLogin }: { onLogin: (user: AuthenticatedUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const data = await response.json();
        setLoginError(data.message || "Verifica tus credenciales e inténtalo nuevamente.");
        return;
      }
      const data = await response.json();
      onLogin({
        id: data.user.id,
        name: data.user.name,
        role: data.user.role === "ADMIN" ? "Administrador" : "Mesero"
      });
    } catch {
      setLoginError("No se pudo conectar con el servidor. Inténtalo nuevamente.");
    } finally {
      setIsLoggingIn(false);
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
        {loginError && <p className="error">{loginError}</p>}
        <button className="primary-button" type="submit" disabled={isLoggingIn}>{isLoggingIn ? "Validando..." : "Ingresar al sistema"} <span>→</span></button>
      </form>
    </section>
  </main>;
}
