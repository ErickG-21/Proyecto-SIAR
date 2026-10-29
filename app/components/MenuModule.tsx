"use client";

import { FormEvent, useEffect, useState } from "react";

type Product = { id: string; name: string; description: string | null; price: string; category: "FOOD" | "DRINK" | "DESSERT"; available: boolean };

export function MenuModule() {
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
