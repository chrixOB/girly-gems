"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  // Star,
  X,
} from "lucide-react";

type Category = "All pieces" | "Necklaces" | "Earrings" | "Rings" | "Bracelets";

type Product = {
  id: number;
  name: string;
  category: Exclude<Category, "All pieces">;
  price: number;
  image: string;
  images?: string[];
  tone: string;
  badge?: string;
};

const categories: Category[] = ["All pieces", "Necklaces", "Earrings", "Rings", "Bracelets"];

const toneByCategory: Record<Product["category"], string> = {
  Necklaces: "butter",
  Earrings: "blush",
  Rings: "sky",
  Bracelets: "mint",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", minimumFractionDigits: 2 }).format(price);
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("All pieces");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productImageIndexes, setProductImageIndexes] = useState<Record<number, number>>({});

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/store/items", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        const storeItems = Array.isArray(data.items) ? data.items : [];
        setProducts(storeItems.map((item: Product) => ({ ...item, tone: toneByCategory[item.category] })));
      } catch {
        setProducts([]);
      }
    }

    loadProducts();
    const refreshTimer = window.setInterval(loadProducts, 1500);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") loadProducts();
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "girly-gems-items-changed") loadProducts();
    };

    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", loadProducts);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearInterval(refreshTimer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", loadProducts);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = activeCategory === "All pieces" || product.category === activeCategory;
      const matchesSearch = !query || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, products, searchQuery]);

  const cartItems = products.filter((product) => cart[product.id]);
  const cartCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  const cartTotal = cartItems.reduce((total, product) => total + product.price * cart[product.id], 0);

  function addToCart(productId: number) {
    setCart((current) => ({ ...current, [productId]: (current[productId] || 0) + 1 }));
    setCartOpen(true);
  }

  function updateQuantity(productId: number, change: number) {
    setCart((current) => {
      const nextQuantity = (current[productId] || 0) + change;
      if (nextQuantity <= 0) {
        const nextCart = { ...current };
        delete nextCart[productId];
        return nextCart;
      }
      return { ...current, [productId]: nextQuantity };
    });
  }

  function toggleFavorite(productId: number) {
    setFavorites((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]);
  }

  return (
    <main className="site-shell">
      <div className="announcement"><Sparkles size={14} /> Free shipping on orders over GH¢75 <ArrowRight size={14} /></div>

      <header className="site-header">
        <button className="icon-button menu-button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={21} /></button>
        <a className="wordmark" href="#top">girly <span>gems</span><i>✦</i></a>
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`}>
          <a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="#story" onClick={() => setMenuOpen(false)}>Our story</a>
          <a href="#journal" onClick={() => setMenuOpen(false)}>Journal</a>
        </nav>
        <div className="header-actions">
          {searchOpen && <input className="search-input" autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search gems" aria-label="Search gems" />}
          <button className="icon-button" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}><Search size={19} /></button>
          <button className="bag-button" aria-label={`Shopping bag, ${cartCount} items`} onClick={() => setCartOpen(true)}><ShoppingBag size={19} /><span>{cartCount}</span></button>
        </div>
      </header>

      <section className="hero" id="top">
        <svg className="hero-filter-defs" aria-hidden="true" focusable="false">
          <filter id="hero-water-ripple" x="-12%" y="-18%" width="124%" height="136%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.035" numOctaves="1" seed="4" result="waterNoise">
              <animate attributeName="baseFrequency" values="0.018 0.035;0.045 0.08;0.018 0.035" dur="1.25s" fill="freeze" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="waterNoise" scale="11" xChannelSelector="R" yChannelSelector="G">
              <animate attributeName="scale" values="11;4;0" keyTimes="0;.38;1" dur="1.25s" fill="freeze" />
            </feDisplacementMap>
          </filter>
        </svg>
        <div className="hero-copy">
          <p className="eyebrow">Small treasures, big energy <span>✦</span></p>
          <h1 className="hero-title">Jewelry for your <em className="hero-title-highlight">main character</em> era.</h1>
          <p className="hero-text">The finishing touch, the conversation starter, the little thing that makes an ordinary Tuesday feel special.</p>
          <a className="primary-button" href="#shop">Find your sparkle <ArrowRight size={17} /></a>
          <div className="hero-note"><div className="avatar-stack"><span>J</span><span>M</span><span>A</span></div><span>Loved by 12,000+ gem girls</span><span className="mini-stars">★★★★★</span></div>
        </div>
        <div className="hero-art"><div className="hero-image"></div><div className="hero-sticker">made to<br /><strong>be noticed</strong><i>✦</i></div><div className="hero-caption"><span>01 / 03</span><span>Golden hour essentials</span></div></div>
      </section>

      <section className="category-strip" id="shop">
        <div><p className="eyebrow">The little luxuries</p><h2>Find your everyday <em>favorite.</em></h2></div>
        <div className="category-tabs">{categories.map((category) => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
      </section>

      <section className="product-section">
        <div className="section-heading"><p>{filteredProducts.length} pieces to love</p><button className="sort-button">Sort by <strong>Featured</strong> <ChevronDown size={15} /></button></div>
        <div className="product-grid">
          {filteredProducts.map((product) => {
            const productImages = product.images?.length ? product.images : [product.image || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85"];
            const activeImageIndex = Math.min(productImageIndexes[product.id] || 0, productImages.length - 1);

            return <article className="product-card" key={product.id}>
            <div className={`product-image ${product.tone}`}>
              <img src={productImages[activeImageIndex]} alt={`${product.name}${productImages.length > 1 ? `, picture ${activeImageIndex + 1} of ${productImages.length}` : ""}`} />
              <button className={`favorite-button ${favorites.includes(product.id) ? "is-favorite" : ""}`} aria-label={`Favorite ${product.name}`} onClick={() => toggleFavorite(product.id)}><Heart size={18} fill={favorites.includes(product.id) ? "currentColor" : "none"} /></button>
              {product.badge && <span className="product-badge">{product.badge}</span>}
              {productImages.length > 1 && <>
                <button className="product-carousel-arrow previous" type="button" aria-label={`Previous picture of ${product.name}`} onClick={() => setProductImageIndexes((current) => ({ ...current, [product.id]: (activeImageIndex - 1 + productImages.length) % productImages.length }))}><ChevronLeft size={17} /></button>
                <button className="product-carousel-arrow next" type="button" aria-label={`Next picture of ${product.name}`} onClick={() => setProductImageIndexes((current) => ({ ...current, [product.id]: (activeImageIndex + 1) % productImages.length }))}><ChevronRight size={17} /></button>
                <div className="product-carousel-dots" role="group" aria-label={`${product.name} pictures`}>
                  {productImages.map((_, index) => <button key={index} className={index === activeImageIndex ? "active" : ""} type="button" aria-label={`View picture ${index + 1} of ${product.name}`} aria-pressed={index === activeImageIndex} onClick={() => setProductImageIndexes((current) => ({ ...current, [product.id]: index }))}><span /></button>)}
                </div>
              </>}
              <button className="quick-add" onClick={() => addToCart(product.id)}>Add to bag <Plus size={16} /></button>
            </div>
            <div className="product-info"><div><h3>{product.name}</h3><p>{product.category}</p></div><strong>{formatPrice(product.price)}</strong></div>
          </article>;
          })}
        </div>
        {filteredProducts.length === 0 && <div className="empty-results"><Sparkles size={24} /><p>No gems found. Try another little search.</p></div>}
      </section>

      <section className="story-band" id="story"><div className="story-image"></div><div className="story-copy"><p className="eyebrow">A little more sparkle</p><h2>Good energy, <em>wearable.</em></h2><p>Girly Gems was born from a love of collecting tiny things that make you feel like yourself. Every piece is designed to mix, match, and make your day a little brighter.</p><a className="text-link" href="#journal">Meet the gems <ArrowRight size={16} /></a></div></section>

      <footer id="journal"><div className="footer-brand"><a className="wordmark" href="#top">girly <span>gems</span><i>✦</i></a><p>Wear what makes you feel like you.</p></div><div className="footer-links"><a href="#shop">Shop all</a><a href="#story">About us</a><a href="#journal">Contact</a><a href="#journal">Shipping & returns</a></div><div className="newsletter"><p>Get the good stuff</p><span>New drops, styling notes, and a little joy.</span><div><input placeholder="Your email address" type="email" /><button aria-label="Subscribe"><ArrowRight size={17} /></button></div></div></footer>

      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="cart-header"><div><p className="eyebrow">Your collection</p><h2>Your bag <span>{cartCount}</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={20} /></button></div>{cartItems.length ? <><div className="cart-items">{cartItems.map((product) => <div className="cart-item" key={product.id}><img src={product.image} alt="" /><div className="cart-item-info"><h3>{product.name}</h3><p>{formatPrice(product.price)}</p><div className="quantity"><button onClick={() => updateQuantity(product.id, -1)} aria-label="Decrease quantity"><Minus size={13} /></button><span>{cart[product.id]}</span><button onClick={() => updateQuantity(product.id, 1)} aria-label="Increase quantity"><Plus size={13} /></button></div></div><strong>{formatPrice(product.price * cart[product.id])}</strong></div>)}</div><div className="cart-footer"><div><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></div><button className="primary-button checkout-button">Checkout <ArrowRight size={17} /></button><p><Check size={14} /> Taxes and shipping calculated at checkout</p></div></> : <div className="empty-cart"><ShoppingBag size={27} /><p>Your bag is waiting for a little sparkle.</p><button className="text-link" onClick={() => setCartOpen(false)}>Keep browsing <ArrowRight size={16} /></button></div>}</aside></div>}
    </main>
  );
}
