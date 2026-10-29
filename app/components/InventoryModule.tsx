"use client";

import { FormEvent, useEffect, useState } from "react";

type Product = { id: string; name: string };
type Inventory = { id: string; currentStock: string; minimumStock: string; unit: string; product: { id: string; name: string; category: string } };

export function InventoryModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<Inventory[]>([]);
  const [form, setForm] = useState({ productId: "", currentStock: "", minimumStock: "", unit: "unidades" });
  const [message, setMessage] = useState("");

  async function load() {
    const [inventoryResponse, productsResponse] = await Promise.all([fetch("/api/inventory"), fetch("/api/products")]);
    if (!inventoryResponse.ok || !productsResponse.ok) throw new Error("No se pudo cargar el inventario.");
    setItems(await inventoryResponse.json());
    setProducts(await productsResponse.json());
  }

  useEffect(() => { load().catch((error: Error) => setMessage(error.message)); }, []);

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, currentStock: Number(form.currentStock), minimumStock: Number(form.minimumStock) }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.message); return; }
    setItems((current) => [data, ...current.filter((item) => item.product.id !== data.product.id)]);
    setForm({ productId: "", currentStock: "", minimumStock: "", unit: "unidades" });
    setMessage("Inventario actualizado correctamente.");
  }

  async function updateStock(item: Inventory) {
    const value = window.prompt(`Nueva cantidad para ${item.product.name}`, item.currentStock);
    if (value === null) return;
    const currentStock = Number(value);
    const response = await fetch(`/api/inventory/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentStock }) });
    if (!response.ok) { setMessage("No se pudo actualizar la cantidad."); return; }
    const updated = await response.json();
    setItems((current) => current.map((currentItem) => currentItem.id === updated.id ? updated : currentItem));
  }

  const availableProducts = products.filter((product) => !items.some((item) => item.product.id === product.id));
  return <div className="users-page"><div className="module-intro"><div><p className="eyebrow">Control de existencias</p><h2>Inventario</h2><p className="muted">Registra productos e identifica las cantidades disponibles.</p></div><span className="users-count">{items.filter((item) => Number(item.currentStock) <= Number(item.minimumStock)).length} requieren atención</span></div><div className="users-layout"><form className="panel user-form" onSubmit={saveItem}><h2>Registrar inventario</h2><p>Asocia existencias a un producto.</p><label htmlFor="inventory-product">Producto</label><select id="inventory-product" required value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })}><option value="">Selecciona un producto</option>{availableProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select><label htmlFor="current-stock">Cantidad actual</label><input id="current-stock" required min="0" step=".01" type="number" value={form.currentStock} onChange={(event) => setForm({ ...form, currentStock: event.target.value })} /><label htmlFor="minimum-stock">Cantidad mínima</label><input id="minimum-stock" required min="0" step=".01" type="number" value={form.minimumStock} onChange={(event) => setForm({ ...form, minimumStock: event.target.value })} /><label htmlFor="inventory-unit">Unidad</label><input id="inventory-unit" required value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} placeholder="kg, litros, unidades" />{message && <p className="form-message">{message}</p>}<button className="primary-button" type="submit">Guardar existencias <span>→</span></button></form><section className="panel users-list"><div className="panel-heading"><div><h2>Existencias registradas</h2><p>Los productos bajo el mínimo requieren atención.</p></div><button className="text-button" onClick={() => load()}>Actualizar ↻</button></div><div className="user-table">{items.map((item) => { const low = Number(item.currentStock) <= Number(item.minimumStock); const progress = Math.min(100, Number(item.currentStock) / Math.max(Number(item.minimumStock) * 2, 1) * 100); return <div className="inventory-row" key={item.id}><div className={`stock-dot ${low ? "red" : "green"}`} /><div><b>{item.product.name}</b><small>Mínimo: {item.minimumStock} {item.unit}</small><div className="progress inventory-progress"><i className={low ? "red" : "green"} style={{ width: `${progress}%` }} /></div></div><strong>{item.currentStock} {item.unit}</strong><span className={`active-badge ${low ? "off" : "on"}`}>{low ? "Reponer" : "Disponible"}</span><button className="row-action" onClick={() => updateStock(item)}>Actualizar</button></div>; })}</div></section></div></div>;
}
