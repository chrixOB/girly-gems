"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PackagePlus,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type StoreItem = {
  id: number;
  name: string;
  category: "Necklaces" | "Earrings" | "Rings" | "Bracelets";
  price: number;
  image: string;
};

type DashboardView = "Overview" | "Products" | "Complaints" | "Customers";

function formatCedis(price: number) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", minimumFractionDigits: 2 }).format(price);
}

export default function DashboardClient() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<DashboardView>("Overview");
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [productModal, setProductModal] = useState<"add" | "edit" | null>(null);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState<StoreItem["category"]>("Necklaces");
  const [productPrice, setProductPrice] = useState("");

  async function loadItems() {
    const response = await fetch("/api/items", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setItems(data.items || []);
  }

  useEffect(() => {
    loadItems().finally(() => setLoading(false));
    const refreshTimer = window.setInterval(loadItems, 3000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  async function removeItem(id: number) {
    const response = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!response.ok) return;
    setItems((current) => current.filter((item) => item.id !== id));
    setNotice("Item removed.");
  }

  function openAddProduct() {
    setEditingItem(null);
    setProductName("");
    setProductCategory("Necklaces");
    setProductPrice("");
    setProductModal("add");
  }

  function openEditProduct(item: StoreItem) {
    setEditingItem(item);
    setProductName(item.name);
    setProductCategory(item.category);
    setProductPrice(String(item.price));
    setProductModal("edit");
  }

  async function saveProduct() {
    const price = Number(productPrice);
    if (!productName.trim() || !Number.isFinite(price) || price < 0) {
      setNotice("Enter a product name and valid price.");
      return;
    }

    const payload = { name: productName.trim(), category: productCategory, price, image: editingItem?.image || "" };
    const response = productModal === "edit"
      ? await fetch(`/api/items/${editingItem?.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (!response.ok) {
      setNotice("The product could not be saved.");
      return;
    }

    await loadItems();
    setProductModal(null);
    setEditingItem(null);
    setNotice(productModal === "edit" ? "Product updated." : "Product added.");
  }

  const visibleItems = items.filter((item) =>
    `${item.name} ${item.category}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="dashboard-shell">
      <aside className={`dashboard-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="dashboard-brand-row">
          <a className="wordmark dashboard-wordmark" href="/">girly <span>gems</span><i>✦</i></a>
          <button className="dashboard-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          {([
            { label: "Overview", icon: LayoutDashboard },
            { label: "Products", icon: Boxes },
            { label: "Complaints", icon: MessageSquare },
            { label: "Customers", icon: Users },
          ] as { label: DashboardView; icon: typeof LayoutDashboard }[]).map(({ label, icon: Icon }) => (
            <button key={label} className={activeView === label ? "active" : ""} onClick={() => { setActiveView(label); setSidebarOpen(false); }}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="dashboard-sidebar-bottom">
          <button><CircleHelp size={18} /><span>Help center</span></button>
          <button><Settings size={18} /><span>Settings</span></button>
          <button className="dashboard-logout" onClick={logout}><LogOut size={18} /><span>Log out</span></button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="dashboard-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="dashboard-search"><Search size={16} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search dashboard" /></div>
          <div className="dashboard-user"><span>GG</span><div><strong>Girly Gems</strong><small>Administrator</small></div><ChevronDown size={15} /></div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-heading"><div><p>Admin workspace</p><h1>{activeView}</h1></div>{activeView === "Products" && <button className="dashboard-primary-button" onClick={openAddProduct}><PackagePlus size={17} /> Add product</button>}</div>
          {notice && <div className="dashboard-notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={14} /></button></div>}
          {activeView === "Overview" && <Overview items={items} complaints={3} />}
          {activeView === "Products" && <ProductsView items={visibleItems} loading={loading} onRemoved={removeItem} onEdit={openEditProduct} />}
          {activeView === "Complaints" && <ComplaintsView />}
          {activeView === "Customers" && <CustomersView />}
          {productModal && <div className="dashboard-modal-backdrop" onMouseDown={() => setProductModal(null)}><section className="dashboard-product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" onMouseDown={(event) => event.stopPropagation()}><div className="dashboard-modal-heading"><div><p>{productModal === "add" ? "New catalogue item" : "Edit catalogue item"}</p><h2 id="product-modal-title">{productModal === "add" ? "Add product" : "Update product"}</h2></div><button onClick={() => setProductModal(null)} aria-label="Close"><X size={18} /></button></div><label>Product name<input value={productName} onChange={(event) => setProductName(event.target.value)} placeholder="e.g. Pearl Drop Earrings" /></label><label>Category<select value={productCategory} onChange={(event) => setProductCategory(event.target.value as StoreItem["category"])}><option>Necklaces</option><option>Earrings</option><option>Rings</option><option>Bracelets</option></select></label><label>Price (GH₵)<input min="0" step="0.01" type="number" value={productPrice} onChange={(event) => setProductPrice(event.target.value)} placeholder="0.00" /></label><div className="dashboard-modal-actions"><button className="dashboard-secondary-button" onClick={() => setProductModal(null)}>Cancel</button><button className="dashboard-primary-button" onClick={saveProduct}>{productModal === "add" ? "Add product" : "Save changes"}</button></div></section></div>}
        </div>
      </section>
    </main>
  );
}

function Overview({ items, complaints }: { items: StoreItem[]; complaints: number }) {
  return <>
    <div className="dashboard-stat-grid">
      <article><div className="dashboard-stat-icon"><ShoppingBag size={18} /></div><p>Total orders</p><strong>128</strong><small><b>+12%</b> this month</small></article>
      <article><div className="dashboard-stat-icon"><Users size={18} /></div><p>Customers</p><strong>1,429</strong><small><b>+8%</b> this month</small></article>
      <article><div className="dashboard-stat-icon"><Boxes size={18} /></div><p>Products</p><strong>{items.length}</strong><small><b>Live</b> catalogue</small></article>
      <article><div className="dashboard-stat-icon"><MessageSquare size={18} /></div><p>Complaints</p><strong>{complaints}</strong><small><b>3</b> need review</small></article>
    </div>
    <div className="dashboard-overview-grid">
      <article className="dashboard-panel dashboard-sales-panel"><div className="dashboard-panel-heading"><div><p>Revenue</p><h2>{formatCedis(12840)}</h2></div><button>Last 30 days <ChevronDown size={14} /></button></div><div className="dashboard-chart"><div className="dashboard-chart-grid" /><svg viewBox="0 0 700 180" preserveAspectRatio="none" aria-label="Revenue trend"><path className="dashboard-chart-area" d="M0 145 C55 130,75 138,125 112 S210 92,245 104 S320 70,365 80 S440 125,480 88 S570 56,620 70 S670 42,700 34 L700 180 L0 180 Z" /><path className="dashboard-chart-line" d="M0 145 C55 130,75 138,125 112 S210 92,245 104 S320 70,365 80 S440 125,480 88 S570 56,620 70 S670 42,700 34" /></svg></div></article>
      <article className="dashboard-panel dashboard-breakdown"><div className="dashboard-panel-heading"><div><p>Category mix</p><h2>Products</h2></div><BarChart3 size={17} /></div>{[ ["Necklaces", 34, "#e99882"], ["Earrings", 29, "#f0c3b7"], ["Rings", 21, "#d8c9e4"], ["Bracelets", 16, "#f2e7a5"] ].map(([label, value, color]) => <div className="dashboard-category-row" key={String(label)}><span>{label}</span><div><i style={{ width: `${value}%`, background: String(color) }} /></div><strong>{value}%</strong></div>)}</article>
    </div>
  </>;
}

function ProductsView({ items, loading, onRemoved, onEdit }: { items: StoreItem[]; loading: boolean; onRemoved: (id: number) => void; onEdit: (item: StoreItem) => void }) {
  return <article className="dashboard-panel dashboard-table-panel"><div className="dashboard-table-header"><div><p>Catalogue</p><h2>All products <span>{items.length}</span></h2></div></div>{loading ? <p className="dashboard-empty">Loading products...</p> : items.length ? <div className="dashboard-table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th><span className="dashboard-sr-only">Actions</span></th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className="dashboard-product-cell"><div className="dashboard-product-thumb"><Sparkles size={16} /></div><strong>{item.name}</strong></div></td><td>{item.category}</td><td>{formatCedis(item.price)}</td><td><span className="dashboard-status">Active</span></td><td><div className="dashboard-row-actions"><button className="dashboard-row-action edit" onClick={() => onEdit(item)}>Edit</button><button className="dashboard-row-action" onClick={() => onRemoved(item.id)}><X size={15} /> Remove</button></div></td></tr>)}</tbody></table></div> : <p className="dashboard-empty">No products match your search.</p>}</article>;
}

function ComplaintsView() {
  const complaints = [{ id: "GG-1042", customer: "Amelia R.", subject: "Order arrived late", status: "Open", date: "Oct 28" }, { id: "GG-1038", customer: "Mia T.", subject: "Size exchange needed", status: "Reviewing", date: "Oct 27" }, { id: "GG-1031", customer: "Sofia L.", subject: "Damaged packaging", status: "Resolved", date: "Oct 25" }];
  return <article className="dashboard-panel dashboard-table-panel"><div className="dashboard-table-header"><div><p>Customer care</p><h2>Complaints <span>{complaints.length}</span></h2></div></div><div className="dashboard-table-wrap"><table><thead><tr><th>ID</th><th>Customer</th><th>Subject</th><th>Date</th><th>Status</th></tr></thead><tbody>{complaints.map((item) => <tr key={item.id}><td><strong>{item.id}</strong></td><td>{item.customer}</td><td>{item.subject}</td><td>{item.date}</td><td><span className={`dashboard-status ${item.status.toLowerCase()}`}>{item.status}</span></td></tr>)}</tbody></table></div></article>;
}

function CustomersView() {
  const customers = [{ name: "Amelia Reed", email: "amelia@example.com", orders: 4, spent: formatCedis(286) }, { name: "Mia Thompson", email: "mia@example.com", orders: 2, spent: formatCedis(124) }, { name: "Sofia Lane", email: "sofia@example.com", orders: 6, spent: formatCedis(418.5) }];
  return <article className="dashboard-panel dashboard-table-panel"><div className="dashboard-table-header"><div><p>Community</p><h2>Customers <span>{customers.length}</span></h2></div></div><div className="dashboard-table-wrap"><table><thead><tr><th>Customer</th><th>Email</th><th>Orders</th><th>Total spent</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.email}><td><strong>{customer.name}</strong></td><td>{customer.email}</td><td>{customer.orders}</td><td>{customer.spent}</td></tr>)}</tbody></table></div></article>;
}
