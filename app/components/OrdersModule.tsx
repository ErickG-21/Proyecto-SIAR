"use client";

import { FormEvent, useEffect, useState } from "react";

type Product = { id: string; name: string; price: string; available: boolean };
type Order = { id: string; number: number; customer: string | null; tableNumber: number | null; total: string; status: string; items: { quantity: number; product: { name: string } }[] };

export function OrdersModule({ waiterId }: { waiterId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customer, setCustomer] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const [productsResponse, ordersResponse] = await Promise.all([fetch("/api/products"), fetch("/api/orders")]);
    if (!productsResponse.ok || !ordersResponse.ok) throw new Error("No se pudieron cargar los pedidos.");
    setProducts(await productsResponse.json());
    setOrders(await ordersResponse.json());
  }

  useEffect(() => { load().catch((error: Error) => setMessage(error.message)); }, []);

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ waiterId, customer, tableNumber: tableNumber ? Number(tableNumber) : null, items: [{ productId, quantity: Number(quantity) }] }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.message); return; }
    setOrders((current) => [data, ...current]);
    setCustomer(""); setTableNumber(""); setQuantity("1"); setMessage("Pedido creado correctamente.");
  }

  async function changeStatus(order: Order, status: string) {
    const response = await fetch(`/api/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) { setMessage("No se pudo actualizar el pedido."); return; }
    const updated = await response.json();
    setOrders((current) => current.map((item) => item.id === updated.id ? { ...item, status: updated.status } : item));
  }

  return <div className="users-page"><div className="module-intro"><div><p className="eyebrow">Operación del restaurante</p><h2>Gestión de pedidos</h2><p className="muted">Crea pedidos y actualiza su estado en tiempo real.</p></div><span className="users-count">{orders.length} pedidos</span></div><div className="users-layout"><form className="panel user-form" onSubmit={createOrder}><h2>Nuevo pedido</h2><p>Registra una orden para una mesa.</p><label htmlFor="order-product">Producto</label><select id="order-product" required value={productId} onChange={(event) => setProductId(event.target.value)}><option value="">Selecciona un producto</option>{products.filter((product) => product.available).map((product) => <option key={product.id} value={product.id}>{product.name} · ${Number(product.price).toLocaleString("es-CO")}</option>)}</select><label htmlFor="order-quantity">Cantidad</label><input id="order-quantity" required min="1" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} /><label htmlFor="order-table">Mesa</label><input id="order-table" min="1" type="number" value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} placeholder="Ej. 4" /><label htmlFor="order-customer">Cliente</label><input id="order-customer" value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="Nombre opcional" />{message && <p className="form-message">{message}</p>}<button className="primary-button" type="submit">Crear pedido <span>→</span></button></form><section className="panel users-list"><div className="panel-heading"><div><h2>Pedidos registrados</h2><p>Consulta y actualiza el flujo de atención.</p></div><button className="text-button" onClick={() => load()}>Actualizar ↻</button></div><div className="user-table">{orders.map((order) => <div className="user-row order-management-row" key={order.id}><div className="quick-icon blue">▣</div><div><b>Pedido #{order.number}</b><small>{order.customer || (order.tableNumber ? `Mesa ${order.tableNumber}` : "Sin mesa")} · {order.items.map((item) => `${item.quantity}x ${item.product.name}`).join(", ")}</small></div><span className={`active-badge ${order.status === "DELIVERED" ? "on" : "off"}`}>{order.status === "PENDING" ? "Pendiente" : order.status === "PREPARING" ? "Preparando" : order.status === "READY" ? "Listo" : order.status === "DELIVERED" ? "Entregado" : "Cancelado"}</span><b>${Number(order.total).toLocaleString("es-CO")}</b><select className="status-select" value={order.status} onChange={(event) => changeStatus(order, event.target.value)}><option value="PENDING">Pendiente</option><option value="PREPARING">Preparando</option><option value="READY">Listo</option><option value="DELIVERED">Entregado</option><option value="CANCELLED">Cancelado</option></select></div>)}</div></section></div></div>;
}
