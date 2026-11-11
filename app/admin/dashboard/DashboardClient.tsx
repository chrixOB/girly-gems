"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  CircleHelp,
  CircleCheck,
  CircleAlert,
  ImagePlus,
  LoaderCircle,
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
  images?: string[];
};

type DashboardView = "Overview" | "Products" | "Complaints" | "Customers";

function formatCedis(price: number) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", minimumFractionDigits: 2 }).format(price);
}

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Unable to read image."));
    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.readAsDataURL(file);
  });
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
  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [operationAlert, setOperationAlert] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

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
    setOperationLoading(`remove-${id}`);
    try {
      const response = await fetch(`/api/items/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setOperationAlert({ type: "error", title: "Item not removed", message: data?.message || "The item could not be removed. Please try again." });
        return;
      }
      setItems((current) => current.filter((item) => item.id !== id));
      localStorage.setItem("girly-gems-items-changed", String(Date.now()));
      setOperationAlert({ type: "success", title: "Item removed", message: "The item was removed from the catalogue." });
    } catch {
      setOperationAlert({ type: "error", title: "Item not removed", message: "Unable to connect to the server. Please try again." });
    } finally {
      setOperationLoading(null);
    }
  }

  function openAddProduct() {
    setEditingItem(null);
    setProductName("");
    setProductCategory("Necklaces");
    setProductPrice("");
    setProductImages([]);
    setImageError("");
    setProductModal("add");
  }

  function openEditProduct(item: StoreItem) {
    setEditingItem(item);
    setProductName(item.name);
    setProductCategory(item.category);
    setProductPrice(String(item.price));
    setProductImages((item.images?.length ? item.images : item.image ? [item.image] : []).slice(0, 3));
    setImageError("");
    setProductModal("edit");
  }

  async function addProductImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = "";
    if (!files.length) return;

    const availableSlots = 3 - productImages.length;
    if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
      setImageError("Use JPEG, PNG, or WebP images.");
      return;
    }
    if (files.some((file) => file.size > 2 * 1024 * 1024)) {
      setImageError("Each image must be 2 MB or smaller.");
      return;
    }
    if (availableSlots <= 0) {
      setImageError("A product can have up to 3 pictures.");
      return;
    }

    setImageLoading(true);
    try {
      const selectedImages = await Promise.all(files.slice(0, availableSlots).map(readImage));
      setProductImages((current) => [...current, ...selectedImages].slice(0, 3));
      setImageError(files.length > availableSlots ? "Only 3 pictures can be added per product." : "");
    } catch {
      setImageError("Unable to read one of those images. Please try again.");
    } finally {
      setImageLoading(false);
    }
  }

  async function saveProduct() {
    const price = Number(productPrice);
    if (!productName.trim() || !Number.isFinite(price) || price < 0) {
      setOperationAlert({ type: "error", title: "Product not saved", message: "Enter a product name and a valid price." });
      return;
    }

    setOperationLoading(productModal === "edit" ? "edit" : "add");
    try {
      const payload = { name: productName.trim(), category: productCategory, price, image: productImages[0] || "", images: productImages };
      const response = productModal === "edit"
        ? await fetch(`/api/items/${editingItem?.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setOperationAlert({ type: "error", title: "Product not saved", message: data?.message || "The product could not be saved. Please try again." });
        return;
      }

      await loadItems();
      localStorage.setItem("girly-gems-items-changed", String(Date.now()));
      setProductModal(null);
      setEditingItem(null);
      setOperationAlert({ type: "success", title: productModal === "edit" ? "Product updated" : "Product added", message: productModal === "edit" ? "Your product changes are now live." : "The new product is now live in the catalogue." });
    } catch {
      setOperationAlert({ type: "error", title: "Product not saved", message: "Unable to connect to the server. Please try again." });
    } finally {
      setOperationLoading(null);
    }
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
          {activeView === "Products" && <ProductsView items={visibleItems} loading={loading} operationLoading={operationLoading} onRemoved={removeItem} onEdit={openEditProduct} />}
          {activeView === "Complaints" && <ComplaintsView />}
          {activeView === "Customers" && <CustomersView />}
          {productModal && (
            <div className="dashboard-modal-backdrop" onMouseDown={() => !operationLoading && !imageLoading && setProductModal(null)}>
              <section className="dashboard-product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" onMouseDown={(event) => event.stopPropagation()}>
                <div className="dashboard-modal-heading">
                  <div><p>{productModal === "add" ? "New catalogue item" : "Edit catalogue item"}</p><h2 id="product-modal-title">{productModal === "add" ? "Add product" : "Update product"}</h2></div>
                  <button disabled={!!operationLoading || imageLoading} onClick={() => setProductModal(null)} aria-label="Close"><X size={18} /></button>
                </div>
                <label>Product name<input disabled={!!operationLoading} value={productName} onChange={(event) => setProductName(event.target.value)} placeholder="e.g. Pearl Drop Earrings" /></label>
                <label>Category<select disabled={!!operationLoading} value={productCategory} onChange={(event) => setProductCategory(event.target.value as StoreItem["category"])}><option>Necklaces</option><option>Earrings</option><option>Rings</option><option>Bracelets</option></select></label>
                <label>Price (GH₵)<input disabled={!!operationLoading} min="0" step="0.01" type="number" value={productPrice} onChange={(event) => setProductPrice(event.target.value)} placeholder="0.00" /></label>
                <div className="dashboard-image-field">
                  <div className="dashboard-image-heading"><span>Product pictures</span><span>{productImages.length}/3</span></div>
                  <div className="dashboard-image-grid">
                    {[0, 1, 2].map((slot) => <div className={`dashboard-image-slot ${productImages[slot] ? "" : "dashboard-image-empty"}`} key={slot}>
                      {productImages[slot] && <>
                        <img src={productImages[slot]} alt={`Product picture ${slot + 1}`} />
                        <button className="dashboard-image-remove" type="button" disabled={!!operationLoading || imageLoading} onClick={() => { setProductImages((current) => current.filter((_, index) => index !== slot)); setImageError(""); }} aria-label={`Remove picture ${slot + 1}`}><X size={14} /></button>
                      </>}
                      {!productImages[slot] && <><ImagePlus size={19} /><span>Picture {slot + 1}</span></>}
                    </div>)}
                  </div>
                  {productImages.length < 3 && <label className="dashboard-image-add"><input accept="image/jpeg,image/png,image/webp" disabled={!!operationLoading || imageLoading} multiple type="file" onChange={addProductImages} /><ImagePlus size={15} />{imageLoading ? "Loading pictures..." : "Add pictures"}</label>}
                  <p className="dashboard-image-hint">JPEG, PNG, or WebP. Up to 2 MB per picture.</p>
                  {imageError && <p className="dashboard-image-error" role="alert">{imageError}</p>}
                </div>
                <div className="dashboard-modal-actions"><button className="dashboard-secondary-button" disabled={!!operationLoading || imageLoading} onClick={() => setProductModal(null)}>Cancel</button><button className="dashboard-primary-button" disabled={!!operationLoading || imageLoading} onClick={saveProduct}>{operationLoading === "add" || operationLoading === "edit" ? <><LoaderCircle className="dashboard-spinner" size={16} /> Saving...</> : productModal === "add" ? "Add product" : "Save changes"}</button></div>
              </section>
            </div>
          )}
          {operationAlert && <div className="dashboard-modal-backdrop dashboard-alert-backdrop"><section className={`dashboard-operation-alert ${operationAlert.type}`} role="alertdialog" aria-modal="true" aria-labelledby="operation-alert-title"><div className="dashboard-operation-alert-icon">{operationAlert.type === "success" ? <CircleCheck size={30} /> : <CircleAlert size={30} />}</div><p>{operationAlert.type === "success" ? "Success" : "Unable to complete"}</p><h2 id="operation-alert-title">{operationAlert.title}</h2><span>{operationAlert.message}</span><button className="dashboard-primary-button" onClick={() => setOperationAlert(null)}>Continue</button></section></div>}
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

function ProductsView({ items, loading, operationLoading, onRemoved, onEdit }: { items: StoreItem[]; loading: boolean; operationLoading: string | null; onRemoved: (id: number) => void; onEdit: (item: StoreItem) => void }) {
  return <article className="dashboard-panel dashboard-table-panel"><div className="dashboard-table-header"><div><p>Catalogue</p><h2>All products <span>{items.length}</span></h2></div></div>{loading ? <p className="dashboard-empty">Loading products...</p> : items.length ? <div className="dashboard-table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th><span className="dashboard-sr-only">Actions</span></th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className="dashboard-product-cell"><div className="dashboard-product-thumb">{item.images?.[0] || item.image ? <img src={item.images?.[0] || item.image} alt="" /> : <Sparkles size={16} />}</div><strong>{item.name}</strong></div></td><td>{item.category}</td><td>{formatCedis(item.price)}</td><td><span className="dashboard-status">Active</span></td><td><div className="dashboard-row-actions"><button className="dashboard-row-action edit" disabled={!!operationLoading} onClick={() => onEdit(item)}>Edit</button><button className="dashboard-row-action" disabled={!!operationLoading} onClick={() => onRemoved(item.id)}>{operationLoading === `remove-${item.id}` ? <><LoaderCircle className="dashboard-spinner" size={14} /> Removing...</> : <><X size={15} /> Remove</>}</button></div></td></tr>)}</tbody></table></div> : <p className="dashboard-empty">No products match your search.</p>}</article>;
}

function ComplaintsView() {
  const complaints = [{ id: "GG-1042", customer: "Amelia R.", subject: "Order arrived late", status: "Open", date: "Oct 28" }, { id: "GG-1038", customer: "Mia T.", subject: "Size exchange needed", status: "Reviewing", date: "Oct 27" }, { id: "GG-1031", customer: "Sofia L.", subject: "Damaged packaging", status: "Resolved", date: "Oct 25" }];
  return <article className="dashboard-panel dashboard-table-panel"><div className="dashboard-table-header"><div><p>Customer care</p><h2>Complaints <span>{complaints.length}</span></h2></div></div><div className="dashboard-table-wrap"><table><thead><tr><th>ID</th><th>Customer</th><th>Subject</th><th>Date</th><th>Status</th></tr></thead><tbody>{complaints.map((item) => <tr key={item.id}><td><strong>{item.id}</strong></td><td>{item.customer}</td><td>{item.subject}</td><td>{item.date}</td><td><span className={`dashboard-status ${item.status.toLowerCase()}`}>{item.status}</span></td></tr>)}</tbody></table></div></article>;
}

function CustomersView() {
  const customers = [{ name: "Amelia Reed", email: "amelia@example.com", orders: 4, spent: formatCedis(286) }, { name: "Mia Thompson", email: "mia@example.com", orders: 2, spent: formatCedis(124) }, { name: "Sofia Lane", email: "sofia@example.com", orders: 6, spent: formatCedis(418.5) }];
  return <article className="dashboard-panel dashboard-table-panel"><div className="dashboard-table-header"><div><p>Community</p><h2>Customers <span>{customers.length}</span></h2></div></div><div className="dashboard-table-wrap"><table><thead><tr><th>Customer</th><th>Email</th><th>Orders</th><th>Total spent</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.email}><td><strong>{customer.name}</strong></td><td>{customer.email}</td><td>{customer.orders}</td><td>{customer.spent}</td></tr>)}</tbody></table></div></article>;
}
