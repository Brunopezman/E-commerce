# 🛒 Rock Merch & Roll – E-commerce

E-commerce de merchandising de bandas de rock. Construido con React 18, TypeScript, Vite y Tailwind CSS. Incluye mock API con json-server, backend real con Express + SQLite y un asistente de compras conversacional (Shopping Concierge).

---

## 🚀 Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18, TypeScript (`strict: true`), Vite, Tailwind CSS |
| Mock API | json-server (`data/db.json`, puerto 3001) |
| Backend real | Express, TypeScript, SQLite (sql.js) — `server/` |

---

## 🎯 Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo Vite (puerto 3000) |
| `npm run build` | TypeScript check + build de producción |
| `npm test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Tests end-to-end (Playwright) |
| `npm run mock:api` | json-server con `data/db.json` (puerto 3001) |
| `npm run server` | Backend real Express (puerto 4000) |

---

## Estructura del proyecto

```
/
├── index.html                 # Entry point React
├── src/
│   ├── main.tsx               # Punto de entrada React
│   ├── App.tsx                # Componente raíz + router
│   ├── components/
│   │   ├── auth/LoginModal.tsx
│   │   ├── cart/CartModal.tsx, CartItemRow.tsx
│   │   ├── catalog/ProductGrid.tsx
│   │   ├── chat/ShoppingConcierge.tsx
│   │   ├── checkout/CheckoutPage.tsx
│   │   └── ui/ProductCard.tsx, Toast.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useCatalog.ts
│   │   └── useConcierge.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── cartService.ts
│   │   ├── checkoutService.ts
│   │   ├── productSearch.ts
│   │   └── productService.ts
│   ├── types/                 # Interfaces TypeScript
│   └── __tests__/             # Tests unitarios
├── data/db.json               # Datos para json-server
├── server/                    # Backend real Express + SQLite
├── public/img/                # Imágenes del catálogo
└── e2e/                       # Tests end-to-end Playwright
```

---

## ⚙️ Arquitectura

### Frontend (React SPA)

- **App.tsx** — renderiza `AuthProvider` → `CartProvider` → `Router`
- **Router** — SPA casero con `useSyncExternalStore`: `pathname.includes('/checkout')` → `CheckoutPage`, sino → `ShopPage`
- **ShopPage** — estado `view` (`'home'` | `'shop'`):
  - Vista `home`: Header + Hero + BannerServices + BrandSection + Footer
  - Vista `shop`: Header + ProductsSection + Footer
- **Contextos**: `CartContext` (carrito + localStorage), `AuthContext` (autenticación mock)
- **Servicios**: lógica de negocio pura (sin JSX) en `src/services/`
- **Shopping Concierge**: chatbot de ventas embebido (FAB + panel) con búsqueda semántica TF-IDF local

### Datos

Los 17 productos del catálogo están en `data/db.json` en formato json-server (`{ "products": [...] }`).

---

## 💬 Shopping Concierge

Asistente de compras conversacional embebido en la UI (FAB flotante + panel de chat).

| Feature | Detalle |
|---|---|
| Búsqueda semántica | Índice TF-IDF local + similitud de coseno sobre nombre, descripción y tipo |
| Filtros | Por precio máximo y categoría (remera, buzo, accesorio, vaso) |
| Intenciones | Saludo, ayuda, búsqueda de productos, agregar al carrito |
| Integración | Agrega productos directamente al carrito via `CartContext` |
| Sin dependencias externas | No necesita API key ni LLM externo — funciona offline |
| Fallback | Carga catálogo desde API real; si falla, desde `/data/db.json` |

---

## 🔌 Backend real (conectado por defecto)

El frontend se conecta al backend real (Express + SQLite en `server/`) en puerto 4000.
Arranque: `npm run server` — las tablas se crean automáticamente y los productos se seedan desde `data/db.json`.

Para usar la mock API con json-server en su lugar: `npm run mock:api` (puerto 3001) y cambiar `BASE_URL` en `src/services/api.ts` a `http://localhost:3001`.

---

## 🧪 Testing

### Unitarios / Integración (Vitest) — 59 tests

```bash
npm test              # Ejecuta todos (vitest run)
npm run test:watch    # Modo watch
```

| Suite | Tests | Descripción |
|---|---|---|
| `products.service.test.js` | 14 | fetchProducts, filterByCategory, searchByName |
| `cart.test.js` | 13 | validarProductoRepetido, eliminarProductoCarrito, vaciarCarrito, actualizarTotal |
| `checkout.test.js` | 24 | detectCardType, validarLuhn, formatearNumeroTarjeta, calcularTotalConInteres, calcularEnvio, calcularResumen |
| `auth.test.js` | 8 | login mock, loadAuthState, saveAuthState, clearAuthState |

### End-to-End (Playwright) — 14 tests

```bash
npm run test:e2e
```

| Suite | Tests | Flujo |
|---|---|---|
| `home.spec.js` | 4 | Carga SPA, navbar, banner-services visible, brand con 6 logos |
| `shop.spec.js` | 4 | Click "Compra Ahora" → productos visibles, banners ocultos, grid con botones |
| `cart.spec.js` | 3 | Contador inicial 0, agregar producto, incrementar cantidad |
| `navigation.spec.js` | 3 | Nav "Productos"/"Inicio", botón "Compra Ahora" |
