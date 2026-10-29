"use client";

import { FormEvent, useEffect, useState } from "react";
import { MenuModule } from "./components/MenuModule";

type Module = "Resumen" | "Pedidos" | "Menú" | "Inventario" | "Usuarios";
type User = { id: string; name: string; email: string; role: "ADMIN" | "WAITER"; active: boolean; createdAt: string };
type Product = { id: string; name: string; description: string | null; price: string; category: "FOOD" | "DRINK" | "DESSERT"; available: boolean };

const modules: { name: Module; icon: string }[] = [
  { name: "Resumen", icon: "⌂" },
  { name: "Pedidos", icon: "▣" },
  { name: "Menú", icon: "☷" },
  { name: "Inventario", icon: "◫" },
  { name: "Usuarios", icon: "♙" }
];

const orders = [
  { id: "#1048", table: "Mesa 04", client: "Carlos Mendoza", total: "$ 48.500", status: "En preparación", tone: "orange" },
  { id: "#1047", table: "Mesa 02", client: "Laura Gómez", total: "$ 32.000", status: "Listo para entregar", tone: "green" },
  { id: "#1046", table: "Domicilio", client: "Andrés Ruiz", total: "$ 61.500", status: "Pendiente", tone: "blue" },
  { id: "#1045", table: "Mesa 07", client: "Sofía Torres", total: "$ 27.000", status: "Entregado", tone: "gray" }
];

const stock = [
  { name: "Tomate chonto", category: "Vegetales", amount: "3.2 kg", progress: 24, tone: "red" },
  { name: "Carne de res", category: "Proteínas", amount: "12.5 kg", progress: 68, tone: "green" },
  { name: "Pan brioche", category: "Panadería", amount: "36 und.", progress: 45, tone: "orange" }
];

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState<Module>("Resumen");
  const [email, setEmail] = useState("admin@siar.com");
  const [password, setPassword] = useState("admin123");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: "Andrea García", role: "Administrador" });

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

      if (response.ok) {
        const data = await response.json();
        setCurrentUser({
          name: data.user.name,
          role: data.user.role === "ADMIN" ? "Administrador" : "Mesero"
        });
        setAuthenticated(true);
        return;
      }

      const data = await response.json();
      setLoginError(data.message || "Verifica tus credenciales e inténtalo nuevamente.");
    } catch {
      setLoginError("No se pudo conectar con el servidor. Inténtalo nuevamente.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  if (!authenticated) {
    return (
      <main className="login-page">
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
          <p className="demo-hint">El acceso se valida contra la base de datos PostgreSQL.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">S</div><strong>SIAR</strong><small>ADMINISTRACIÓN</small></div>
        <div className="restaurant-switch"><span className="restaurant-icon">🍴</span><span><b>La Esquina</b><small>Restaurante principal</small></span><span className="chevron">⌄</span></div>
        <p className="nav-label">MENÚ PRINCIPAL</p>
        <nav>{modules.map((module) => <button key={module.name} className={activeModule === module.name ? "nav-item active" : "nav-item"} onClick={() => setActiveModule(module.name)}><span>{module.icon}</span>{module.name}{module.name === "Pedidos" && <em>4</em>}</button>)}</nav>
        <div className="sidebar-bottom"><button className="nav-item"><span>⚙</span>Configuración</button><button className="nav-item logout" onClick={() => setAuthenticated(false)}><span>↪</span>Cerrar sesión</button><div className="user-mini"><div className="avatar">{currentUser.name.slice(0, 2).toUpperCase()}</div><span><b>{currentUser.name}</b><small>{currentUser.role}</small></span><span>•••</span></div></div>
      </aside>
      <section className="content">
        <header className="topbar"><div><p className="breadcrumb">Inicio / <b>{activeModule}</b></p><h1>{activeModule === "Resumen" ? "Buenos días, Andrea" : activeModule}</h1></div><div className="top-actions"><button className="icon-button">⌕</button><button className="icon-button notification">♢<i /></button><div className="header-avatar">AG</div></div></header>
        {activeModule === "Resumen" ? <Dashboard /> : activeModule === "Usuarios" ? <UsersModule /> : activeModule === "Menú" ? <MenuModule /> : <ModulePlaceholder module={activeModule} />}
      </section>
    </main>
  );
}

function Dashboard() {
  return <div className="dashboard">
    <div className="welcome-row"><p>Aquí tienes un resumen de lo que ocurre hoy en <b>La Esquina.</b></p><button className="outline-button">Hoy · 24 Jun 2024 <span>⌄</span></button></div>
    <section className="metrics">
      <Metric title="Ventas del día" value="$ 1.284.500" detail="+12.5% vs. ayer" trend="up" icon="$" />
      <Metric title="Pedidos recibidos" value="38" detail="+8.2% vs. ayer" trend="up" icon="▣" />
      <Metric title="Ticket promedio" value="$ 33.802" detail="-2.4% vs. ayer" trend="down" icon="↗" />
      <Metric title="Productos en stock" value="124" detail="6 requieren atención" trend="alert" icon="◫" />
    </section>
    <div className="main-grid"><section className="panel sales-panel"><div className="panel-heading"><div><h2>Ventas de la semana</h2><p>Comparativo de ingresos diarios</p></div><button className="select-button">Esta semana <span>⌄</span></button></div><div className="chart"><div className="chart-y"><span>$600k</span><span>$400k</span><span>$200k</span><span>$0</span></div><div className="chart-area"><div className="grid-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 640 220" preserveAspectRatio="none" aria-label="Gráfica de ventas"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#f47b4c" stopOpacity=".25" /><stop offset="100%" stopColor="#f47b4c" stopOpacity="0" /></linearGradient></defs><path d="M0 180 C35 165 50 130 90 145 S145 170 180 130 S240 115 270 135 S330 95 360 112 S420 120 450 78 S515 92 540 48 S600 78 640 38 L640 220 L0 220Z" fill="url(#fill)" /><path d="M0 180 C35 165 50 130 90 145 S145 170 180 130 S240 115 270 135 S330 95 360 112 S420 120 450 78 S515 92 540 48 S600 78 640 38" fill="none" stroke="#ee7548" strokeWidth="3" /></svg><div className="chart-x"><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span></div></div></div></section>
      <section className="panel orders-panel"><div className="panel-heading"><div><h2>Pedidos recientes</h2><p>Últimos pedidos registrados</p></div><button className="text-button">Ver todos →</button></div><div className="order-list">{orders.slice(0, 3).map((order) => <div className="order-row" key={order.id}><div className="order-id"><b>{order.id}</b><small>{order.table}</small></div><div className="order-client">{order.client}<small>Hoy, 12:4{8 - orders.indexOf(order)} pm</small></div><div className="order-total"><b>{order.total}</b><span className={`status ${order.tone}`}>{order.status}</span></div></div>)}</div></section>
    </div>
    <div className="bottom-grid"><section className="panel stock-panel"><div className="panel-heading"><div><h2>Estado del inventario</h2><p>Productos con menor disponibilidad</p></div><button className="text-button">Gestionar inventario →</button></div>{stock.map((item) => <div className="stock-row" key={item.name}><div className="stock-name"><span className={`stock-dot ${item.tone}`} /><span><b>{item.name}</b><small>{item.category}</small></span></div><div className="progress"><i className={item.tone} style={{ width: `${item.progress}%` }} /></div><b className="stock-amount">{item.amount}</b></div>)}</section><section className="panel quick-panel"><h2>Acciones rápidas</h2><p>Accede a las tareas más frecuentes</p><div className="quick-actions"><button><span className="quick-icon orange">+</span><b>Nuevo pedido</b><small>Registrar una orden</small></button><button><span className="quick-icon blue">☷</span><b>Agregar producto</b><small>Actualizar el menú</small></button><button><span className="quick-icon green">♙</span><b>Nuevo usuario</b><small>Invitar a tu equipo</small></button></div></section></div>
  </div>;
}

function Metric({ title, value, detail, trend, icon }: { title: string; value: string; detail: string; trend: string; icon: string }) {
  return <article className="metric"><div className={`metric-icon ${trend}`}>{icon}</div><div className="metric-title">{title}<span>ⓘ</span></div><strong>{value}</strong><small className={trend === "down" ? "negative" : trend === "alert" ? "warning" : ""}>{trend === "up" ? "↗" : trend === "down" ? "↘" : "!"} {detail}</small></article>;
}

function ModulePlaceholder({ module }: { module: Module }) {
  return <div className="empty-module"><div className="empty-icon">☷</div><h2>Módulo de {module.toLowerCase()}</h2><p>Esta sección está lista para conectar con los datos del sistema.</p><button className="primary-button">Crear primer registro <span>→</span></button></div>;
}

function UsersModule() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "WAITER" as User["role"] });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    const response = await fetch("/api/users");
    if (!response.ok) throw new Error("No se pudieron cargar los usuarios.");
    setUsers(await response.json());
  }

  function LegacyMenuModule() {
    const [products, setProducts] = useState<Product[]>([]);
    const [form, setForm] = useState({ name: "", description: "", price: "", category: "FOOD" as Product["category"] });
    const [message, setMessage] = useState("");

    useEffect(() => {
      fetch("/api/products").then(async (response) => {
        if (!response.ok) throw new Error("No se pudieron cargar los productos.");
        setProducts(await response.json());
      }).catch((error: Error) => setMessage(error.message));
    }, []);

    async function createProduct(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const response = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, price: Number(form.price) }) });
      const data = await response.json();
      if (!response.ok) { setMessage(data.message); return; }
      setProducts((current) => [data, ...current]);
      setForm({ name: "", description: "", price: "", category: "FOOD" });
      setMessage("Producto creado correctamente.");
    }

    async function toggleProduct(product: Product) {
      const response = await fetch(`/api/products/${product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ available: !product.available }) });
      if (!response.ok) { setMessage("No se pudo actualizar el producto."); return; }
      const updated = await response.json();
      setProducts((current) => current.map((item) => item.id === updated.id ? updated : item));
    }

    async function deleteProduct(product: Product) {
      if (!window.confirm(`¿Eliminar ${product.name}?`)) return;
      const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      if (!response.ok) { setMessage("No se pudo eliminar el producto."); return; }
      setProducts((current) => current.filter((item) => item.id !== product.id));
    }

    return <div className="users-page"><div className="module-intro"><div><p className="eyebrow">Carta del restaurante</p><h2>Gestión del menú</h2><p className="muted">Administra los productos disponibles para tus pedidos.</p></div><span className="users-count">{products.length} productos</span></div><div className="users-layout"><form className="panel user-form" onSubmit={createProduct}><h2>Nuevo producto</h2><p>Agrega un producto a la carta.</p><label htmlFor="product-name">Nombre</label><input id="product-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ej. Hamburguesa clásica" /><label htmlFor="product-description">Descripción</label><input id="product-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Descripción breve" /><label htmlFor="product-price">Precio</label><input id="product-price" required min="1" step=".01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="25000" /><label htmlFor="product-category">Categoría</label><select id="product-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as Product["category"] })}><option value="FOOD">Comida</option><option value="DRINK">Bebida</option><option value="DESSERT">Postre</option></select>{message && <p className="form-message">{message}</p>}<button className="primary-button" type="submit">Guardar producto <span>→</span></button></form><section className="panel users-list"><div className="panel-heading"><div><h2>Productos registrados</h2><p>Activa, desactiva o elimina elementos del menú.</p></div></div><div className="user-table">{products.map((product) => <div className="user-row" key={product.id}><div className="quick-icon orange">☷</div><div><b>{product.name}</b><small>{product.description || "Sin descripción"}</small></div><span className="role-badge waiter">{product.category === "FOOD" ? "Comida" : product.category === "DRINK" ? "Bebida" : "Postre"}</span><span className={`active-badge ${product.available ? "on" : "off"}`}>{product.available ? "Disponible" : "Agotado"}</span><b>${Number(product.price).toLocaleString("es-CO")}</b><button className="row-delete" onClick={() => deleteProduct(product)} aria-label={`Eliminar ${product.name}`}>×</button><button className="row-action" onClick={() => toggleProduct(product)}>{product.available ? "Agotar" : "Activar"}</button></div>)}</div></section></div></div>;
  }

  useEffect(() => {
    loadUsers().catch((error: Error) => setMessage(error.message)).finally(() => setLoading(false));
  }, []);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || "No se pudo crear el usuario.");
      return;
    }
    setUsers((current) => [data, ...current]);
    setForm({ name: "", email: "", password: "", role: "WAITER" });
    setMessage("Usuario creado correctamente.");
  }

  async function toggleUser(user: User) {
    const response = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active })
    });
    if (!response.ok) {
      setMessage("No se pudo actualizar el estado del usuario.");
      return;
    }
    const updated = await response.json();
    setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
  }

  async function deleteUser(user: User) {
    if (!window.confirm(`¿Eliminar a ${user.name}?`)) return;
    const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("No se pudo eliminar el usuario.");
      return;
    }
    setUsers((current) => current.filter((item) => item.id !== user.id));
  }

  return <div className="users-page">
    <div className="module-intro"><div><p className="eyebrow">Equipo del restaurante</p><h2>Gestión de usuarios</h2><p className="muted">Registra y administra los accesos de administradores y meseros.</p></div><span className="users-count">{users.length} usuarios</span></div>
    <div className="users-layout">
      <form className="panel user-form" onSubmit={createUser}><h2>Nuevo usuario</h2><p>Agrega una cuenta para tu equipo.</p><label htmlFor="user-name">Nombre completo</label><input id="user-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ej. Laura Gómez" /><label htmlFor="user-email">Correo electrónico</label><input id="user-email" required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="correo@ejemplo.com" /><label htmlFor="user-password">Contraseña</label><input id="user-password" required minLength={6} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Mínimo 6 caracteres" /><label htmlFor="user-role">Rol</label><select id="user-role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as User["role"] })}><option value="WAITER">Mesero</option><option value="ADMIN">Administrador</option></select>{message && <p className="form-message">{message}</p>}<button className="primary-button" type="submit">Guardar usuario <span>→</span></button></form>
      <section className="panel users-list"><div className="panel-heading"><div><h2>Usuarios registrados</h2><p>Gestiona los permisos de acceso al sistema.</p></div><button className="text-button" onClick={() => loadUsers()}>Actualizar ↻</button></div>{loading ? <p className="muted">Cargando usuarios...</p> : users.length === 0 ? <p className="muted">No hay usuarios registrados.</p> : <div className="user-table">{users.map((user) => <div className="user-row" key={user.id}><div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div><div><b>{user.name}</b><small>{user.email}</small></div><span className={`role-badge ${user.role === "ADMIN" ? "admin" : "waiter"}`}>{user.role === "ADMIN" ? "Administrador" : "Mesero"}</span><span className={`active-badge ${user.active ? "on" : "off"}`}>{user.active ? "Activo" : "Inactivo"}</span><button className="row-action" onClick={() => toggleUser(user)}>{user.active ? "Desactivar" : "Activar"}</button><button className="row-delete" onClick={() => deleteUser(user)} aria-label={`Eliminar ${user.name}`}>×</button></div>)}</div>}</section>
    </div>
  </div>;
}
