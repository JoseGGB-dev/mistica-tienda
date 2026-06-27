import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  ShoppingBag, X, Plus, Minus, Heart, Menu, MessageCircle,
  Instagram, Tag, ChevronRight, Sparkles, Truck, ShieldCheck,
} from "lucide-react";
import {
  ALL_PRODUCTS, CATEGORIES, C, IG_URL, openWA, svgFallback,
  type Product,
} from "../data/mistica";
import { LOGO } from "../data/logo";

// ── wholesale pricing rules ─────────────────────────────────
// El precio por mayor se aplica POR PRODUCTO cuando su cantidad es >= 3.
const WHOLESALE_MIN = 3;
type CartLike = { product: Product; qty: number }[];
const getCartCount = (cart: CartLike) => cart.reduce((s, i) => s + i.qty, 0);
function getUnitPrice(product: Product, qty: number) {
  return qty >= WHOLESALE_MIN && product.mayorPrice ? product.mayorPrice : product.price;
}
function hasWholesaleDiscount(product: Product, qty: number) {
  return qty >= WHOLESALE_MIN && !!product.mayorPrice && product.mayorPrice < product.price;
}
function getWholesaleMessage(product: Product, qty: number): string | null {
  if (!product.mayorPrice) return null;
  if (qty >= WHOLESALE_MIN) return "Precio por mayor activado 💗";
  const faltan = WHOLESALE_MIN - qty;
  return `Agrega ${faltan} más de este producto para activar precio por mayor 🩷`;
}
const CART_KEY = "mistica-cart";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mistica · Moda femenina, bikinis, tops y vestidos" },
      { name: "description", content: "Boutique de moda femenina en Perú: bikinis, tops y vestidos con diseños modernos. Compra fácil por WhatsApp y precios por mayor." },
      { property: "og:title", content: "Mistica · Boutique de moda femenina" },
      { property: "og:description", content: "Bikinis, tops y vestidos para verte segura, linda y auténtica. Compra rápida por WhatsApp." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: MisticaPage,
});

// ── style helpers ───────────────────────────────────────────
type CSS = React.CSSProperties;
const pill = (bg: string, color: string, border?: string): CSS => ({
  backgroundColor: bg, color, border: border || "none",
  borderRadius: 9999, padding: "10px 22px", fontWeight: 600,
  fontSize: "0.875rem", cursor: "pointer", transition: "all .25s ease",
  display: "inline-flex", alignItems: "center", gap: 8, lineHeight: 1,
});
const card: CSS = {
  backgroundColor: C.white, borderRadius: 22, overflow: "hidden",
  boxShadow: "0 1px 2px rgba(42,35,48,.04), 0 12px 28px -18px rgba(232,62,140,.25)",
  transition: "transform .3s ease, box-shadow .3s ease",
  border: `1px solid ${C.line}`,
};
const eyebrow: CSS = {
  color: C.strong, fontWeight: 700, fontSize: "0.72rem",
  textTransform: "uppercase", letterSpacing: "0.18em",
  marginBottom: 10, display: "inline-block",
};
const sectionTitle: CSS = {
  fontSize: "clamp(1.8rem, 4.2vw, 2.6rem)", fontWeight: 600,
  color: C.dark, fontFamily: "'Playfair Display', Georgia, serif",
  marginBottom: 12, letterSpacing: "-0.01em",
};

// ── product card ────────────────────────────────────────────
function ProductCard({ p, onView, onAdd }: { p: Product; onView: (p: Product) => void; onAdd: (p: Product) => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="product-card"
      style={{ ...card, transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? "0 6px 14px rgba(42,35,48,.06), 0 24px 50px -20px rgba(232,62,140,.35)" : card.boxShadow }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div className="product-image-wrap" style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4", backgroundColor: C.bgSoft }}>
        <img className="product-image" src={p.img} alt={p.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
            transition: "transform .7s ease", transform: hov ? "scale(1.06)" : "scale(1)" }}
          onError={e => { const t = e.currentTarget; t.onerror = null; t.src = svgFallback(p.category); }}
        />
        {p.badge && (
          <span style={{
            position: "absolute", top: 14, left: 14,
            backgroundColor: p.badge === "Promo" ? C.dark : C.white,
            color: p.badge === "Promo" ? "#fff" : C.dark,
            borderRadius: 999, padding: "5px 12px", fontSize: "0.68rem",
            fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            boxShadow: "0 4px 12px rgba(0,0,0,.08)",
          }}>{p.badge}</span>
        )}
        <button onClick={() => onView(p)} aria-label="Vista rápida"
          style={{ position: "absolute", right: 14, bottom: 14,
            width: 40, height: 40, borderRadius: "50%", border: "none", cursor: "pointer",
            backgroundColor: "rgba(255,255,255,.95)", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 16px rgba(0,0,0,.12)",
            opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(6px)",
            transition: "all .25s ease",
          }}>
          <Heart size={16} color={C.strong} />
        </button>
      </div>
      <div className="product-card-body" style={{ padding: "18px 18px 20px" }}>
        <span style={{ ...eyebrow, fontSize: "0.62rem", marginBottom: 6, color: C.gray }}>{p.category}</span>
        <h3 className="product-title" style={{ fontSize: "0.95rem", color: C.dark, fontWeight: 500, marginBottom: 10, lineHeight: 1.4,
          fontFamily: "'Playfair Display', Georgia, serif" }}>{p.name}</h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: "1.15rem", fontWeight: 700, color: C.dark }}>S/ {p.price.toFixed(2)}</span>
          {p.oldPrice && <span style={{ fontSize: "0.8rem", color: C.gray, textDecoration: "line-through" }}>S/ {p.oldPrice}</span>}
        </div>
        {p.mayorPrice && (
          <p style={{ fontSize: "0.74rem", color: C.gray, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
            <Tag size={11} color={C.pink} /> Mayor: <strong style={{ color: C.strong }}>S/ {p.mayorPrice}</strong>
          </p>
        )}
        <div className="product-actions" style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={() => onView(p)} style={{ flex: 1, ...pill("transparent", C.dark, `1px solid ${C.line}`),
            justifyContent: "center", padding: "10px 0", fontSize: "0.78rem", fontWeight: 600 }}>Ver detalle</button>
          <button onClick={() => onAdd(p)} style={{ flex: 1, ...pill(C.dark, "#fff"),
            justifyContent: "center", padding: "10px 0", fontSize: "0.78rem" }}>
            <ShoppingBag size={13} /> Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── modal ───────────────────────────────────────────────────
function ProductModal({ p, onClose, onAdd }: { p: Product; onClose: () => void; onAdd: (p: Product) => void }) {
  const waMsg = `Hola, me interesa este producto de Mistica:\n\n*${p.name}*\nPrecio: S/${p.price}\n\n¿Está disponible?`;
  return (
    <div className="product-modal-backdrop" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(42,35,48,0.55)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      animation: "fadeIn .2s ease" }} onClick={onClose}>
      <div className="product-modal-card" style={{ backgroundColor: C.white, borderRadius: 24, maxWidth: 760, width: "100%",
        maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ position: "relative", backgroundColor: C.bgSoft }}>
          <img className="product-modal-image" src={p.img} alt={p.name}
            style={{ width: "100%", maxHeight: 460, objectFit: "cover", display: "block", borderRadius: "24px 24px 0 0" }}
            onError={e => { const t = e.currentTarget; t.onerror = null; t.src = svgFallback(p.category); }} />
          <button onClick={onClose} aria-label="Cerrar"
            style={{ position: "absolute", top: 14, right: 14, backgroundColor: "rgba(255,255,255,0.95)",
              border: "none", borderRadius: "50%", width: 40, height: 40, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}>
            <X size={18} color={C.dark} />
          </button>
          {p.badge && (
            <span style={{ position: "absolute", top: 14, left: 14,
              backgroundColor: p.badge === "Promo" ? C.dark : C.white,
              color: p.badge === "Promo" ? "#fff" : C.dark,
              borderRadius: 999, padding: "6px 14px", fontSize: "0.7rem",
              fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{p.badge}</span>
          )}
        </div>
        <div className="product-modal-body" style={{ padding: "28px 32px 34px" }}>
          <span style={eyebrow}>{p.category}</span>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 600, color: C.dark, marginBottom: 14,
            lineHeight: 1.25, fontFamily: "'Playfair Display', Georgia, serif" }}>{p.name}</h2>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 10 }}>
            <span style={{ fontSize: "1.8rem", fontWeight: 700, color: C.dark }}>S/ {p.price.toFixed(2)}</span>
            {p.oldPrice && <span style={{ fontSize: "1rem", color: C.gray, textDecoration: "line-through" }}>S/ {p.oldPrice}</span>}
          </div>
          {p.mayorPrice && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: C.accent,
              borderRadius: 12, padding: "8px 14px", marginBottom: 18 }}>
              <Tag size={14} color={C.strong} />
              <span style={{ fontSize: "0.85rem", color: C.dark }}>
                Precio por mayor: <strong style={{ color: C.strong }}>S/ {p.mayorPrice}</strong>
              </span>
            </div>
          )}
          <p style={{ color: C.gray, fontSize: "0.92rem", lineHeight: 1.75, marginBottom: 18 }}>{p.desc}</p>
          <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
            {p.material && <div style={{ fontSize: "0.85rem" }}><span style={{ color: C.gray }}>Material: </span><strong style={{ color: C.dark }}>{p.material}</strong></div>}
            {p.size && <div style={{ fontSize: "0.85rem" }}><span style={{ color: C.gray }}>Talla: </span><strong style={{ color: C.dark }}>{p.size}</strong></div>}
          </div>
          <div className="product-modal-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => { onAdd(p); onClose(); }}
              style={{ flex: 1, minWidth: 160, ...pill(C.dark, "#fff"), justifyContent: "center", padding: "14px 0", fontSize: "0.92rem" }}>
              <ShoppingBag size={16} /> Agregar al carrito
            </button>
            <button onClick={() => openWA(waMsg)}
              style={{ flex: 1, minWidth: 160, ...pill("#25D366", "#fff"), justifyContent: "center", padding: "14px 0", fontSize: "0.92rem" }}>
              <MessageCircle size={16} /> Consultar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── cart sidebar ────────────────────────────────────────────
type CartItem = { product: Product; qty: number };
function CartSidebar({ cart, onClose, onUpdate, total, onSend }: {
  cart: CartItem[]; onClose: () => void; onUpdate: (id: number, delta: number) => void; total: number; onSend: () => void;
}) {
  const count = getCartCount(cart);
  return (
    <div className="cart-overlay" style={{ position: "fixed", inset: 0, zIndex: 900 }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(42,35,48,0.45)" }} onClick={onClose} />
      <div className="cart-drawer" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "min(440px,100vw)",
        backgroundColor: C.white, boxShadow: "-4px 0 40px rgba(0,0,0,0.14)",
        display: "flex", flexDirection: "column", animation: "slideInRight .3s ease" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.line}`, display: "flex",
          justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShoppingBag color={C.strong} size={22} />
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: C.dark, margin: 0 }}>Tu carrito</h2>
            {count > 0 && <span style={{ backgroundColor: C.strong, color: "#fff", borderRadius: "50%",
              width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.72rem", fontWeight: 700 }}>{count}</span>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={20} color={C.gray} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <ShoppingBag size={52} color={C.accent} style={{ margin: "0 auto 16px" }} />
              <p style={{ color: C.gray, marginBottom: 20 }}>Tu carrito está vacío</p>
              <button onClick={onClose} style={pill(C.dark, "#fff")}>Ver catálogo</button>
            </div>
          ) : (
            <>
              {cart.map(item => {
                const showWholesale = hasWholesaleDiscount(item.product, item.qty);
                const u = getUnitPrice(item.product, item.qty);
                const msg = getWholesaleMessage(item.product, item.qty);
                return (
                <div className="cart-item" key={item.product.id} style={{ display: "flex", gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.line}` }}>
                  <img className="cart-item-image" src={item.product.img} alt={item.product.name}
                    style={{ width: 76, height: 92, objectFit: "cover", borderRadius: 12, flexShrink: 0, backgroundColor: C.bgSoft }}
                    onError={e => { const t = e.currentTarget; t.onerror = null; t.src = svgFallback(item.product.category); }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.84rem", fontWeight: 600, color: C.dark, marginBottom: 4, lineHeight: 1.35 }}>{item.product.name}</p>
                    {showWholesale ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, margin: 0 }}>
                        <span style={{ fontSize: "0.62rem", color: C.strong, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>Precio por mayor</span>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{ fontSize: "0.82rem", color: C.strong, fontWeight: 700 }}>S/ {item.product.mayorPrice!.toFixed(2)} c/u</span>
                          <span style={{ fontSize: "0.72rem", color: C.gray, textDecoration: "line-through" }}>S/ {item.product.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: "0.62rem", color: C.gray, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>Precio normal</span>
                        <p style={{ fontSize: "0.82rem", color: C.dark, fontWeight: 700, margin: "2px 0 0" }}>S/ {item.product.price.toFixed(2)} c/u</p>
                        {msg && (
                          <p style={{ fontSize: "0.68rem", color: C.strong, margin: "4px 0 0", fontWeight: 500 }}>
                            {msg}
                          </p>
                        )}
                      </>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                      <button onClick={() => onUpdate(item.product.id, item.qty <= 1 ? 0 : -1)}
                        style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.line}`,
                          background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Minus size={12} color={C.dark} />
                      </button>
                      <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center", color: C.dark }}>{item.qty}</span>
                      <button onClick={() => onUpdate(item.product.id, 1)}
                        style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.line}`,
                          background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Plus size={12} color={C.dark} />
                      </button>
                      <button onClick={() => onUpdate(item.product.id, 0)} aria-label="Quitar"
                        style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer" }}>
                        <X size={15} color={C.gray} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.92rem", fontWeight: 800, color: C.dark, whiteSpace: "nowrap", margin: 0 }}>
                      S/ {(u * item.qty).toFixed(2)}
                    </p>
                  </div>
                </div>
              );})}
            </>
          )}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: `1px solid ${C.line}`, backgroundColor: C.bgSoft }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
              <span style={{ color: C.gray, fontSize: "0.9rem" }}>Total del pedido</span>
              <span style={{ fontSize: "1.4rem", fontWeight: 800, color: C.dark }}>S/ {total.toFixed(2)}</span>
            </div>
            <button onClick={onSend}
              style={{ ...pill("#25D366", "#fff"), width: "100%", justifyContent: "center", padding: "14px 0", fontSize: "0.95rem" }}>
              <MessageCircle size={18} /> Enviar pedido por WhatsApp
            </button>
            <p style={{ fontSize: "0.72rem", color: C.gray, textAlign: "center", marginTop: 10 }}>
              Te redirigiremos a WhatsApp con el resumen de tu pedido
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── navbar ──────────────────────────────────────────────────
function Navbar({ cartCount, onCartOpen, isMobile }: { cartCount: number; onCartOpen: () => void; isMobile: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };
  const navLinks: [string, string][] = [
    ["Inicio", "hero"], ["Catálogo", "catalogo"], ["Promos", "promos"], ["Mayorista", "mayorista"], ["Contacto", "contacto"],
  ];
  return (
    <nav className="main-nav" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
      backgroundColor: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)",
      backdropFilter: "saturate(180%) blur(14px)",
      WebkitBackdropFilter: "saturate(180%) blur(14px)",
      borderBottom: scrolled ? `1px solid ${C.line}` : "1px solid transparent",
      transition: "all .3s ease" }}>
      <div className="nav-inner" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <button className="brand-button" onClick={() => scrollTo("hero")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <img src={LOGO} alt="Mistica" style={{ height: 44, borderRadius: 10 }} />
          <span className="brand-name" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.3rem", fontWeight: 600, color: C.dark, letterSpacing: ".02em" }}>
            Mistica
          </span>
        </button>
        {!isMobile && (
          <div style={{ display: "flex", gap: 2 }}>
            {navLinks.map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)}
                style={{ background: "none", border: "none", color: C.dark, fontWeight: 500,
                  cursor: "pointer", padding: "8px 14px", borderRadius: 999, fontSize: "0.88rem", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = C.strong; e.currentTarget.style.backgroundColor = C.accent; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.dark; e.currentTarget.style.backgroundColor = "transparent"; }}
              >{label}</button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isMobile && (
            <button onClick={() => openWA("Hola, quiero comprar en Mistica 🩷")}
              style={{ ...pill("#25D366", "#fff"), padding: "9px 18px", fontSize: "0.82rem" }}>
              <MessageCircle size={14} /> WhatsApp
            </button>
          )}
          <button onClick={onCartOpen} aria-label="Carrito"
            style={{ position: "relative", background: C.white, border: `1px solid ${C.line}`,
              cursor: "pointer", padding: 10, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShoppingBag size={18} color={C.dark} />
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, backgroundColor: C.strong, color: "#fff",
                borderRadius: "50%", width: 20, height: 20, fontSize: "0.65rem", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>
            )}
          </button>
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú"
              style={{ background: C.white, border: `1px solid ${C.line}`, cursor: "pointer", padding: 10, borderRadius: 999 }}>
              {menuOpen ? <X size={18} color={C.dark} /> : <Menu size={18} color={C.dark} />}
            </button>
          )}
        </div>
      </div>
      {isMobile && menuOpen && (
        <div className="mobile-menu" style={{ backgroundColor: C.white, borderTop: `1px solid ${C.line}`, padding: "8px 24px 20px" }}>
          {navLinks.map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)}
              style={{ display: "flex", width: "100%", textAlign: "left", background: "none", border: "none",
                color: C.dark, fontWeight: 500, cursor: "pointer", padding: "14px 0", fontSize: "1rem",
                borderBottom: `1px solid ${C.line}`, alignItems: "center", justifyContent: "space-between" }}>
              {label} <ChevronRight size={16} color={C.gray} />
            </button>
          ))}
          <button onClick={() => { openWA("Hola, quiero comprar en Mistica 🩷"); setMenuOpen(false); }}
            style={{ ...pill("#25D366", "#fff"), width: "100%", justifyContent: "center", marginTop: 16, padding: "14px 0" }}>
            <MessageCircle size={16} /> Comprar por WhatsApp
          </button>
        </div>
      )}
    </nav>
  );
}

// ── hero ────────────────────────────────────────────────────
function Hero() {
  const heroPicks = useMemo(() => [ALL_PRODUCTS[7], ALL_PRODUCTS[0], ALL_PRODUCTS[9]], []);
  return (
    <section id="hero" className="hero-section" style={{
      position: "relative", overflow: "hidden", paddingTop: 120, paddingBottom: 80,
      background: `radial-gradient(1200px 600px at 80% -10%, ${C.accent} 0%, transparent 60%),
                   radial-gradient(900px 500px at -10% 40%, #FCE2EE 0%, transparent 60%),
                   linear-gradient(180deg, ${C.bg} 0%, ${C.bgSoft} 100%)`,
    }}>
      <span style={{ position: "absolute", color: C.strong, fontSize: "3.5rem", top: "12%", left: "7%", opacity: 0.18, pointerEvents: "none" }}>♡</span>
      <span style={{ position: "absolute", color: C.strong, fontSize: "5rem", top: "22%", right: "6%", opacity: 0.12, pointerEvents: "none" }}>♡</span>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px",
        display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)",
        gap: 56, alignItems: "center" }} className="hero-grid">
        {/* left */}
        <div className="hero-copy" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,.7)",
            border: `1px solid ${C.line}`, borderRadius: 9999, padding: "7px 16px", marginBottom: 24 }}>
            <Sparkles size={13} color={C.strong} />
            <span style={{ fontSize: "0.74rem", color: C.strong, fontWeight: 700, letterSpacing: "0.12em" }}>NUEVA COLECCIÓN · VERANO</span>
          </div>
          <h1 className="hero-title" style={{ fontSize: "clamp(2.3rem, 5.4vw, 4rem)", fontWeight: 600, color: C.dark,
            lineHeight: 1.08, marginBottom: 22, fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "-0.015em", margin: "0 0 22px" }}>
            Moda femenina para verte{" "}
            <em style={{ color: C.strong, fontStyle: "italic" }}>segura, linda y auténtica</em>
          </h1>
          <p className="hero-subtitle" style={{ fontSize: "1.08rem", color: C.gray, maxWidth: 520, lineHeight: 1.7, marginBottom: 32 }}>
            Bikinis, tops y vestidos con diseños modernos para cada ocasión. Pieza por pieza, pensados para ti.
          </p>
          <div className="hero-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
              style={{ ...pill(C.dark, "#fff"), padding: "15px 30px", fontSize: "0.95rem" }}>
              Ver catálogo <ChevronRight size={16} />
            </button>
            <button onClick={() => openWA("Hola, quiero comprar en Mistica 🩷")}
              style={{ ...pill("#25D366", "#fff"), padding: "15px 30px", fontSize: "0.95rem" }}>
              <MessageCircle size={16} /> Comprar por WhatsApp
            </button>
          </div>
          <div className="hero-badges" style={{ display: "flex", gap: 10, marginTop: 32, flexWrap: "wrap" }}>
            {[
              { icon: <Sparkles size={13} />, t: "Stock limitado" },
              { icon: <Tag size={13} />, t: "Precios por mayor" },
              { icon: <MessageCircle size={13} />, t: "Compra rápida por WhatsApp" },
            ].map(b => (
              <span key={b.t} style={{ display: "inline-flex", alignItems: "center", gap: 6,
                backgroundColor: "rgba(255,255,255,.85)", border: `1px solid ${C.line}`,
                color: C.dark, borderRadius: 999, padding: "7px 14px", fontSize: "0.78rem", fontWeight: 500 }}>
                <span style={{ color: C.strong, display: "inline-flex" }}>{b.icon}</span> {b.t}
              </span>
            ))}
          </div>
        </div>
        {/* right collage */}
        <div style={{ position: "relative", height: 540 }} className="hero-collage">
          <FloatingCard p={heroPicks[0]} style={{ left: "0%", top: "6%", width: 230, rotate: "-6deg", zIndex: 2 }} />
          <FloatingCard p={heroPicks[1]} style={{ right: "0%", top: "0%", width: 260, rotate: "5deg", zIndex: 3 }} accent />
          <FloatingCard p={heroPicks[2]} style={{ left: "20%", bottom: "0%", width: 240, rotate: "-2deg", zIndex: 1 }} />
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ p, style, accent }: { p: Product; style: CSS & { rotate?: string }; accent?: boolean }) {
  const { rotate, ...rest } = style;
  return (
    <div className="floating-card" style={{
      position: "absolute", borderRadius: 22, overflow: "hidden",
      backgroundColor: "#fff", boxShadow: "0 24px 60px -20px rgba(42,35,48,.28)",
      transform: `rotate(${rotate || "0deg"})`,
      border: accent ? `1px solid ${C.accent}` : `1px solid ${C.line}`,
      ...rest,
    }}>
      <div style={{ position: "relative", aspectRatio: "3/4", backgroundColor: C.bgSoft }}>
        <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { const t = e.currentTarget; t.onerror = null; t.src = svgFallback(p.category); }} />
        {p.badge && (
          <span style={{ position: "absolute", top: 10, left: 10, backgroundColor: C.dark, color: "#fff",
            borderRadius: 999, padding: "4px 10px", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {p.badge}
          </span>
        )}
      </div>
      <div style={{ padding: "10px 14px 12px" }}>
        <p style={{ margin: 0, fontSize: "0.72rem", color: C.gray, letterSpacing: ".08em", textTransform: "uppercase" }}>{p.category}</p>
        <p style={{ margin: "2px 0 0", fontSize: "0.85rem", fontWeight: 600, color: C.dark }}>S/ {p.price.toFixed(2)}</p>
      </div>
    </div>
  );
}

// ── benefits ────────────────────────────────────────────────
function Benefits() {
  const items = [
    { icon: <Sparkles size={20} color={C.strong} />, title: "Diseños exclusivos", desc: "Piezas limitadas con identidad boutique." },
    { icon: <MessageCircle size={20} color={C.strong} />, title: "Compra por WhatsApp", desc: "Atención personal, rápida y sin complicaciones." },
    { icon: <Tag size={20} color={C.strong} />, title: "Precios por mayor", desc: "Ideal para emprendedoras que revenden." },
    { icon: <Truck size={20} color={C.strong} />, title: "Envíos a todo el Perú", desc: "Coordinamos por WhatsApp el método más cómodo." },
  ];
  return (
    <section className="benefits-section" style={{ backgroundColor: C.white, padding: "70px 24px", borderBottom: `1px solid ${C.line}` }}>
      <div className="benefits-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        {items.map(item => (
          <div className="benefit-card" key={item.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "8px 4px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.accent,
              display: "grid", placeItems: "center", flexShrink: 0 }}>{item.icon}</div>
            <div>
              <p style={{ fontWeight: 700, color: C.dark, margin: "2px 0 4px", fontSize: "0.95rem" }}>{item.title}</p>
              <p style={{ color: C.gray, fontSize: "0.84rem", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── catalog ─────────────────────────────────────────────────
function Catalog({ onAdd, onView, activeCategory, setActiveCategory }: {
  onAdd: (p: Product) => void; onView: (p: Product) => void;
  activeCategory: string; setActiveCategory: (c: string) => void;
}) {
  const filtered = useMemo(() => {
    if (activeCategory === "Todos") return ALL_PRODUCTS;
    if (activeCategory === "Promos") return ALL_PRODUCTS.filter(p => p.oldPrice);
    if (activeCategory === "Por mayor") return ALL_PRODUCTS.filter(p => p.mayorPrice);
    return ALL_PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="catalogo" className="catalog-section" style={{ padding: "96px 24px",
      background: `linear-gradient(180deg, ${C.bgSoft} 0%, ${C.bg} 100%)` }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="section-header" style={{ textAlign: "center", marginBottom: 44 }}>
          <span style={eyebrow}>El catálogo</span>
          <h2 style={sectionTitle}>Piezas pensadas para verte como te sientes</h2>
          <p style={{ color: C.gray, maxWidth: 520, margin: "10px auto 0", fontSize: "0.98rem", lineHeight: 1.7 }}>
            Filtra por categoría y descubre la prenda perfecta para ti.
          </p>
        </div>
        <div className="category-filters" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 44 }}>
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{
                  ...pill(active ? C.dark : "rgba(255,255,255,.85)", active ? "#fff" : C.dark,
                    active ? "1px solid transparent" : `1px solid ${C.line}`),
                  padding: "9px 18px", fontSize: "0.82rem", fontWeight: active ? 700 : 500,
                  backdropFilter: "blur(6px)",
                }}>
                {cat}
              </button>
            );
          })}
        </div>
        <div className="product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
          {filtered.map(p => <ProductCard key={p.id} p={p} onView={onView} onAdd={onAdd} />)}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.gray }}>No hay productos en esta categoría.</div>
        )}
      </div>
    </section>
  );
}

// ── mayorista ───────────────────────────────────────────────
function Mayorista() {
  const waMsg = "Hola, quiero consultar precios por mayor en Mistica 🩷";
  return (
    <section id="mayorista" className="mayorista-section" style={{
      padding: "100px 24px", position: "relative", overflow: "hidden",
      background: `linear-gradient(135deg, #FFE3F0 0%, #FBD4E5 45%, #F2C2D7 100%)`,
    }}>
      <div style={{ position: "absolute", top: -120, right: -120, width: 420, height: 420, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,.55), transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: -160, left: -100, width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,62,140,.18), transparent 70%)" }} />
      <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center", color: C.dark, position: "relative", zIndex: 1 }}>
        <span style={{ ...eyebrow, color: C.strong }}>Mayoristas</span>
        <h2 style={{ ...sectionTitle, fontSize: "clamp(2rem, 4.6vw, 3rem)" }}>
          Compra por mayor y empieza a vender con <em style={{ color: C.strong, fontStyle: "italic" }}>Mistica</em>
        </h2>
        <p style={{ fontSize: "1.05rem", color: C.dark, opacity: 0.78,
          maxWidth: 580, margin: "14px auto 36px", lineHeight: 1.75 }}>
          Precios especiales para emprendedoras. Arma tu pedido a partir de pocas unidades y consúltanos por WhatsApp.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
          {[
            { icon: <Tag size={14} />, t: "Precios por mayor" },
            { icon: <ShieldCheck size={14} />, t: "Stock garantizado" },
            { icon: <MessageCircle size={14} />, t: "Atención WhatsApp" },
          ].map(b => (
            <span key={b.t} style={{ display: "inline-flex", alignItems: "center", gap: 8,
              backgroundColor: "rgba(255,255,255,.7)", border: `1px solid rgba(255,255,255,.6)`,
              borderRadius: 999, padding: "10px 18px", fontSize: "0.84rem", fontWeight: 600, color: C.dark,
              backdropFilter: "blur(8px)" }}>
              <span style={{ color: C.strong, display: "inline-flex" }}>{b.icon}</span> {b.t}
            </span>
          ))}
        </div>
        <button onClick={() => openWA(waMsg)}
          style={{ ...pill(C.dark, "#fff"), padding: "16px 40px", fontSize: "1rem",
            boxShadow: "0 10px 30px rgba(42,35,48,.25)" }}>
          <MessageCircle size={18} /> Consultar precios por mayor
        </button>
      </div>
    </section>
  );
}

// ── promos ──────────────────────────────────────────────────
function Promos({ onAdd, onView }: { onAdd: (p: Product) => void; onView: (p: Product) => void }) {
  const promos = ALL_PRODUCTS.filter(p => p.oldPrice);
  return (
    <section id="promos" className="promos-section" style={{ backgroundColor: C.white, padding: "96px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="section-header" style={{ textAlign: "center", marginBottom: 44 }}>
          <span style={eyebrow}>Ofertas activas</span>
          <h2 style={sectionTitle}>Promociones de la temporada</h2>
          <p style={{ color: C.gray, fontSize: "0.98rem", marginTop: 10 }}>
            Aprovecha los precios especiales antes que se agoten.
          </p>
        </div>
        <div className="product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
          {promos.map(p => <ProductCard key={p.id} p={p} onView={onView} onAdd={onAdd} />)}
        </div>
      </div>
    </section>
  );
}

// ── contact ─────────────────────────────────────────────────
function Contact() {
  const items = [
    {
      key: "wa",
      icon: <MessageCircle size={32} color={C.strong} />,
      title: "WhatsApp",
      desc: "Escríbenos para consultar disponibilidad",
      onClick: () => openWA("Hola Mistica, quiero hacer una consulta 🩷"),
    },
    {
      key: "ig",
      icon: <Instagram size={32} color={C.strong} />,
      title: "Instagram",
      desc: "Síguenos y mira nuestras novedades",
      onClick: () => { if (typeof window !== "undefined") window.open(IG_URL, "_blank"); },
    },
  ];
  return (
    <section id="contacto" className="contact-section" style={{ backgroundColor: C.bgSoft, padding: "96px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <span style={eyebrow}>Contáctanos</span>
        <h2 style={sectionTitle}>Estamos para ti</h2>
        <p style={{ color: C.gray, maxWidth: 480, margin: "10px auto 44px", fontSize: "0.98rem", lineHeight: 1.7 }}>
          ¿Tienes dudas sobre tallas, colores o disponibilidad? Escríbenos y te respondemos enseguida.
        </p>
        <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 22, justifyContent: "center" }}>
          {items.map(item => (
            <button
              className="contact-card"
              key={item.key}
              onClick={item.onClick}
              type="button"
              style={{
                backgroundColor: C.white, borderRadius: 22, padding: "34px 24px",
                boxShadow: "0 2px 14px rgba(232,62,140,0.06)", border: `1px solid ${C.line}`,
                transition: "transform .2s, box-shadow .2s", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 18px 40px -16px rgba(232,62,140,.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 14px rgba(232,62,140,0.06)"; }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: "50%", backgroundColor: C.accent,
                display: "grid", placeItems: "center", marginBottom: 4,
              }}>{item.icon}</div>
              <p style={{ fontWeight: 700, color: C.dark, margin: 0, fontSize: "1.05rem",
                fontFamily: "'Playfair Display', Georgia, serif" }}>{item.title}</p>
              <p style={{ color: C.gray, fontSize: "0.88rem", margin: 0, lineHeight: 1.55 }}>{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── footer ──────────────────────────────────────────────────
function Footer() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <footer className="footer-section" style={{ backgroundColor: "#1A1320", color: "#fff", padding: "60px 24px 30px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 36, marginBottom: 44 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <img src={LOGO} alt="Mistica" style={{ height: 44, borderRadius: 10 }} />
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.4rem", fontWeight: 600 }}>Mistica</span>
            </div>
            <p style={{ color: "#B7A6B6", fontSize: "0.88rem", lineHeight: 1.75, maxWidth: 260 }}>
              Boutique femenina. Bikinis, tops y vestidos con diseños modernos para verte linda y auténtica.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => openWA("Hola Mistica! 🩷")}
                style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#25D366",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={18} color="#fff" />
              </button>
              <button onClick={() => window.open(IG_URL, "_blank")}
                style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#E1306C",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Instagram size={18} color="#fff" />
              </button>
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 18, color: C.accent, fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase" }}>Links rápidos</p>
            {([["Inicio", "hero"], ["Catálogo", "catalogo"], ["Promos", "promos"], ["Mayorista", "mayorista"], ["Contacto", "contacto"]] as [string,string][]).map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
                  color: "#B7A6B6", cursor: "pointer", padding: "5px 0", fontSize: "0.88rem", transition: "color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "#B7A6B6"}>
                <ChevronRight size={13} /> {label}
              </button>
            ))}
          </div>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 18, color: C.accent, fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase" }}>Categorías</p>
            {["Bikinis", "Tops", "Vestidos", "Promos", "Por mayor"].map(cat => (
              <button key={cat}
                onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
                  color: "#B7A6B6", cursor: "pointer", padding: "5px 0", fontSize: "0.88rem" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "#B7A6B6"}>
                <ChevronRight size={13} /> {cat}
              </button>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 22,
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <p style={{ color: "#6E5F6D", fontSize: "0.8rem", margin: 0 }}>© {new Date().getFullYear()} Mistica. Todos los derechos reservados.</p>
          <p style={{ color: "#6E5F6D", fontSize: "0.8rem", margin: 0 }}>Hecho con 🩷 en Perú</p>
        </div>
      </div>
    </footer>
  );
}

// ── main ────────────────────────────────────────────────────
function MisticaPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [isMobile, setIsMobile] = useState(false);

  // hydrate cart from localStorage once on mount (client only)
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(CART_KEY) : null;
      if (raw) {
        const saved = JSON.parse(raw) as CartItem[];
        if (Array.isArray(saved)) {
          // re-link product to source of truth so price changes propagate
          const restored = saved
            .map(i => {
              const fresh = ALL_PRODUCTS.find(p => p.id === i.product?.id);
              return fresh ? { product: fresh, qty: Math.max(1, Number(i.qty) || 1) } : null;
            })
            .filter(Boolean) as CartItem[];
          setCart(restored);
        }
      }
    } catch { /* ignore corrupted storage */ }
    setCartHydrated(true);
  }, []);

  // persist cart on every change (after hydration)
  useEffect(() => {
    if (!cartHydrated || typeof window === "undefined") return;
    try {
      if (cart.length === 0) window.localStorage.removeItem(CART_KEY);
      else window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch { /* storage full or blocked */ }
  }, [cart, cartHydrated]);

  useEffect(() => {
    // fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    // responsive
    const onResize = () => setIsMobile(window.innerWidth < 900);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
    toast.success(`${product.name} agregado al carrito 🩷`);
  };
  const updateCart = (id: number, delta: number) => {
    if (delta === 0) setCart(prev => prev.filter(i => i.product.id !== id));
    else setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const cartCount = getCartCount(cart);
  const cartTotal = cart.reduce((s, i) => s + getUnitPrice(i.product, i.qty) * i.qty, 0);

  const sendOrder = () => {
    const items = cart.map((item, idx) => {
      const u = getUnitPrice(item.product, item.qty);
      const tag = hasWholesaleDiscount(item.product, item.qty)
        ? "Precio por mayor aplicado"
        : "Precio normal";
      return `${idx + 1}. ${item.product.name} - ${item.qty}u - S/${(u * item.qty).toFixed(2)} - ${tag}`;
    }).join("\n");
    const msg = `Hola, quiero hacer un pedido en Mistica 🩷\n\nProductos:\n${items}\n\nTotal: S/${cartTotal.toFixed(2)}\n\nTambién quiero consultar disponibilidad de colores y tallas.`;
    openWA(msg);
  };

  return (
    <div style={{ backgroundColor: C.bg, color: C.dark,
      fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
      minHeight: "100vh", width: "100%", overflowX: "hidden" }}>

      <style>{`
        html, body, #root { background: ${C.bg}; margin: 0; padding: 0; width: 100%; }
        body { font-family: 'DM Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }

        /* Mejoras solo para vista celular / tablet. Escritorio queda igual. */
        @media (max-width: 900px) {
          .nav-inner { height: 64px !important; padding: 0 16px !important; }
          .brand-button img { height: 40px !important; }
          .brand-name { font-size: 1.12rem !important; }
          .mobile-menu { padding: 8px 18px 18px !important; box-shadow: 0 18px 40px -30px rgba(42,35,48,.35) !important; }

          .hero-section { padding-top: 92px !important; padding-bottom: 54px !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 30px !important; padding: 0 18px !important; }
          .hero-copy { text-align: center !important; }
          .hero-title { font-size: clamp(2.05rem, 11vw, 3.2rem) !important; line-height: 1.06 !important; margin-bottom: 16px !important; }
          .hero-subtitle { font-size: .98rem !important; line-height: 1.65 !important; margin: 0 auto 24px !important; max-width: 34rem !important; }
          .hero-actions { justify-content: center !important; gap: 10px !important; }
          .hero-actions > button { min-height: 46px !important; }
          .hero-badges { justify-content: center !important; margin-top: 22px !important; gap: 8px !important; }
          .hero-badges span { font-size: .72rem !important; padding: 7px 12px !important; }
          .hero-collage { height: 360px !important; width: min(100%, 390px) !important; margin: 4px auto 0 !important; }
          .floating-card { width: min(46vw, 178px) !important; border-radius: 18px !important; }
          .hero-collage .floating-card:nth-child(1) { left: 0 !important; top: 24px !important; }
          .hero-collage .floating-card:nth-child(2) { right: 0 !important; top: 0 !important; }
          .hero-collage .floating-card:nth-child(3) { left: 26% !important; bottom: 0 !important; }

          .benefits-section, .catalog-section, .promos-section, .contact-section { padding: 64px 16px !important; }
          .mayorista-section { padding: 72px 16px !important; }
          .benefits-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
          .benefit-card { background: rgba(255,247,251,.72) !important; border: 1px solid ${C.line} !important; border-radius: 18px !important; padding: 16px !important; }

          .section-header { margin-bottom: 30px !important; }
          .section-header h2, .contact-section h2, .mayorista-section h2 { font-size: clamp(1.75rem, 8vw, 2.35rem) !important; line-height: 1.12 !important; }
          .section-header p, .contact-section p, .mayorista-section p { font-size: .92rem !important; }
          .category-filters { justify-content: flex-start !important; overflow-x: auto !important; flex-wrap: nowrap !important; padding: 2px 2px 12px !important; margin: 0 -2px 30px !important; scrollbar-width: none; }
          .category-filters::-webkit-scrollbar { display: none; }
          .category-filters button { flex: 0 0 auto !important; padding: 9px 17px !important; }

          .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 14px !important; }
          .product-card { border-radius: 18px !important; }
          .product-card-body { padding: 14px 13px 15px !important; }
          .product-title { font-size: .86rem !important; line-height: 1.32 !important; min-height: 2.3em !important; }
          .product-actions { gap: 7px !important; }
          .product-actions button { font-size: .72rem !important; padding: 9px 0 !important; }

          .product-modal-backdrop { align-items: flex-end !important; padding: 0 !important; }
          .product-modal-card { width: 100% !important; max-height: 92vh !important; border-radius: 24px 24px 0 0 !important; }
          .product-modal-image { max-height: 340px !important; border-radius: 24px 24px 0 0 !important; }
          .product-modal-body { padding: 22px 18px 26px !important; }
          .product-modal-actions { flex-direction: column !important; }
          .product-modal-actions button { width: 100% !important; min-width: 0 !important; }

          .cart-drawer { width: 100vw !important; }
          .cart-item { gap: 12px !important; margin-bottom: 16px !important; padding-bottom: 16px !important; }
          .cart-item-image { width: 70px !important; height: 86px !important; border-radius: 14px !important; }
          .floating-whatsapp { width: 54px !important; height: 54px !important; right: 18px !important; bottom: 18px !important; }

          .contact-grid { grid-template-columns: 1fr !important; gap: 14px !important; max-width: 380px !important; margin: 0 auto !important; }
          .contact-card { padding: 28px 20px !important; }
          .footer-section { text-align: center !important; padding: 52px 18px 28px !important; }
          .footer-section div { justify-content: center; }
        }

        @media (max-width: 520px) {
          .brand-name { display: none !important; }
          .hero-section { padding-top: 84px !important; padding-bottom: 42px !important; }
          .hero-title { font-size: clamp(2rem, 12vw, 2.7rem) !important; }
          .hero-actions { flex-direction: column !important; align-items: stretch !important; max-width: 340px !important; margin: 0 auto !important; }
          .hero-actions button { width: 100% !important; justify-content: center !important; }
          .hero-collage { height: 310px !important; }
          .floating-card { width: min(44vw, 155px) !important; }
          .hero-collage .floating-card:nth-child(3) { left: 24% !important; }

          .product-grid { grid-template-columns: 1fr !important; gap: 18px !important; }
          .product-card { max-width: 430px !important; margin: 0 auto !important; width: 100% !important; }
          .product-image-wrap { aspect-ratio: 4 / 5 !important; }
          .product-actions button { font-size: .78rem !important; }

          .cart-drawer { border-radius: 22px 22px 0 0 !important; top: 8vh !important; }
          .cart-item { align-items: flex-start !important; }
          .cart-item-image { width: 66px !important; height: 82px !important; }
        }
      `}</style>
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} isMobile={isMobile} />
      <main>
        <Hero />
        <Benefits />
        <Catalog onAdd={addToCart} onView={setModalProduct} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        <Mayorista />
        <Promos onAdd={addToCart} onView={setModalProduct} />
        <Contact />
      </main>
      <Footer />
      {modalProduct && <ProductModal p={modalProduct} onClose={() => setModalProduct(null)} onAdd={addToCart} />}
      {cartOpen && <CartSidebar cart={cart} onClose={() => setCartOpen(false)} onUpdate={updateCart} total={cartTotal} onSend={sendOrder} />}
      <button className="floating-whatsapp" onClick={() => openWA("Hola, quiero comprar en Mistica 🩷")} title="Comprar por WhatsApp"
        style={{ position: "fixed", bottom: 24, right: 24, backgroundColor: "#25D366", color: "#fff",
          border: "none", borderRadius: "50%", width: 58, height: 58, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(37,211,102,0.45)", zIndex: 400, transition: "transform .2s, box-shadow .2s" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
        <MessageCircle size={26} color="#fff" />
      </button>
    </div>
  );
}
