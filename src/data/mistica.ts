export const WA = "51970781424";
export const IG_URL = "https://www.instagram.com/misticashop.peru/";

export const C = {
  bg: "#FFF7FB",
  bgSoft: "#FFEFF6",
  pink: "#F062A6",
  strong: "#E83E8C",
  accent: "#F7DDE8",
  nude: "#F3E3D3",
  dark: "#2A2330",
  gray: "#7A7282",
  line: "#F1E2EC",
  white: "#FFFFFF",
} as const;

export type Product = {
  id: number;
  category: "Bikinis" | "Tops" | "Vestidos";
  name: string;
  price: number;
  oldPrice: number | null;
  mayorPrice: number | null;
  badge: "Promo" | "Por mayor" | null;
  material: string;
  size: string;
  desc: string;
  img: string;
};

export const ALL_PRODUCTS: Product[] = [
  { id:1, category:"Bikinis", name:"Bikini con copa + truza tanguita doble pita", price:25, oldPrice:35, mayorPrice:null, badge:"Promo",
    material:"Licra suplex, baby rib o piel de durazno", size:"Talla estándar",
    desc:"Talla estándar con copa. Recomendado para bra 34, 36 y 38. Copa con relleno aprox. 36B, altura 15 cm aprox. Truza con contorno de 62 cm que cede hasta 110 cm. Pitas ajustables. Copa embolsada con forro, no removible. Truza con forro delantero.",
    img:"/productos/bikini-doble-pita.jpg" },
  { id:2, category:"Bikinis", name:"Bikini con copa + truza tanguita una pita", price:25, oldPrice:35, mayorPrice:null, badge:"Promo",
    material:"Licra suplex, baby rib o piel de durazno", size:"Talla estándar",
    desc:"Talla estándar con copa. Recomendado para bra 34, 36 y 38. Copa con relleno aprox. 36B. Pitas ajustables. Copa embolsada con forro, no removible. Truza con forro delantero.",
    img:"/productos/bikini-una-pita.jpg" },
  { id:3, category:"Bikinis", name:"Bikini copa + truza semihilo", price:25, oldPrice:35, mayorPrice:null, badge:"Promo",
    material:"Licra suplex, baby rib o piel de durazno", size:"Talla estándar",
    desc:"Talla estándar con copa. Truza semihilo ajustable con pitas a los costados. Copa embolsada con forro, no removible. Truza con forro delantero.",
    img:"/productos/bikini-semihilo.jpg" },
  { id:4, category:"Bikinis", name:"Bikini Satin XS-S", price:35, oldPrice:45, mayorPrice:35, badge:"Promo",
    material:"Satin", size:"XS-S",
    desc:"Bikini de tela satin, talla XS-S. Sin copa, embolsado. Diseño delicado con acabado brillante y estilo femenino.",
    img:"/productos/bikini-satin.jpg" },
  { id:5, category:"Bikinis", name:"Bikini dos piezas", price:45, oldPrice:null, mayorPrice:35, badge:"Por mayor",
    material:"Licra suplex", size:"Talla estándar",
    desc:"Talla estándar, sin copas. Material licra suplex. Top con doble forro en la parte delantera. Truza con forro en la parte delantera. Modelos con truza semihilo y truza tanga doble pita.",
    img:"/productos/bikini-dos-piezas.jpg" },
  { id:6, category:"Bikinis", name:"Bikini con top de caída", price:40, oldPrice:50, mayorPrice:40, badge:"Promo",
    material:"Licra suplex / mesh estampado", size:"Talla estándar",
    desc:"Talla estándar, sin copa, embolsado. Diseño con top tipo halter y caída transparente/mesh estampada. Pitas ajustables en cuello y espalda. Truza ajustable a los costados.",
    img:"/productos/bikini-top-caida.jpg" },
  { id:7, category:"Vestidos", name:"Vestido brasileño", price:65, oldPrice:null, mayorPrice:50, badge:"Por mayor",
    material:"Suplex", size:"Talla estándar",
    desc:"Vestido corto estilo brasileño, moderno y elegante. Manga larga, corte asimétrico de un hombro, parte superior suelta y parte inferior ajustada.",
    img:"/productos/vestido-brasileno.jpg" },
  { id:8, category:"Vestidos", name:"Vestido halter lazo", price:50, oldPrice:null, mayorPrice:38, badge:"Por mayor",
    material:"Suplex", size:"Talla estándar",
    desc:"Vestido corto estilo halter con lazo al cuello. Ajuste al cuerpo, diseño fruncido en laterales y escote profundo. Ideal para salidas, fiestas o looks modernos.",
    img:"/productos/vestido-halter-lazo.jpg" },
  { id:9, category:"Vestidos", name:"Vestido Cami", price:60, oldPrice:null, mayorPrice:48, badge:"Por mayor",
    material:"Suplex", size:"Talla estándar",
    desc:"Vestido de tiras delgadas, espalda cruzada con amarre ajustable y abertura alta lateral. Diseño elegante, atrevido y femenino.",
    img:"/productos/vestido-cami.jpg" },
  { id:10, category:"Tops", name:"Top Bele", price:40, oldPrice:null, mayorPrice:32, badge:"Por mayor",
    material:"Suplex", size:"Talla estándar",
    desc:"Top estilo halter, escote profundo, tiras al cuello, fruncido en la parte del busto y ajuste en cintura tipo crop top.",
    img:"/productos/top-bele.jpg" },
  { id:11, category:"Tops", name:"Top Cami Suplex", price:40, oldPrice:null, mayorPrice:30, badge:"Por mayor",
    material:"Suplex", size:"Talla estándar",
    desc:"Top asimétrico de un hombro, ajustado al cuerpo, con corte diagonal en la parte inferior. Ideal para outfits casuales o de fiesta.",
    img:"/productos/top-cami.jpg" },
  { id:12, category:"Tops", name:"Top Katy", price:30, oldPrice:null, mayorPrice:22, badge:"Por mayor",
    material:"Suplex", size:"Talla estándar",
    desc:"Top estilo halter, escote profundo, ajuste debajo del busto y caída tipo blusa abierta al frente.",
    img:"/productos/top-katy.jpg" },
];

export const CATEGORIES = ["Todos", "Bikinis", "Tops", "Vestidos", "Promos", "Por mayor"] as const;

export const svgFallback = (category: string) => {
  const fill = category === "Bikinis" ? "FFC8DC" : category === "Vestidos" ? "F3D9EE" : "F5E0CE";
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='540'><defs><linearGradient id='g' x1='0' x2='0' y1='0' y2='1'><stop offset='0%25' stop-color='%23${fill}'/><stop offset='100%25' stop-color='%23FFF1F6'/></linearGradient></defs><rect fill='url(%23g)' width='400' height='540'/><text fill='%23E83E8C' font-family='Georgia,serif' font-size='38' x='200' y='270' text-anchor='middle' font-style='italic'>Mistica</text><text fill='%23B07A95' font-family='sans-serif' font-size='14' x='200' y='300' text-anchor='middle' letter-spacing='4'>${encodeURIComponent(category.toUpperCase())}</text></svg>`;
};

export function openWA(msg: string) {
  if (typeof window === "undefined") return;
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank");
}
