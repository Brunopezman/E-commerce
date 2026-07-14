# AGENTS.md — E-Commerce Rock Merch & Roll (Squad de Agentes)

Este archivo lo lee todo agente/subagente de opencode antes de trabajar. Contiene las reglas globales del repo. Las reglas específicas de cada rol viven en `.opencode/agent/*.md`.

## Qué es este repo

E-commerce de merchandising de rock. **Stack actual:** React 18+, TypeScript (`strict: true`), Vite, Tailwind CSS. Sin backend en producción: los datos viven en `data/db.json` y se cargan vía `fetch`. El proyecto incluye mock API (json-server) y backend real (Express + SQLite en `server/`).

Estado: fases 1-4 completas. Ver `docs/archive/fases-history.md` para detalle histórico.

## Convenciones de código

- Componentes funcionales, lógica de negocio en hooks/`services/`, nunca mezclada con JSX.
- TypeScript `strict: true`, sin `any`.
- Ver skill `coding-standards` para estructura de carpetas y naming detallado.

## Proceso de tareas

- Todo cambio de comportamiento visible (no solo refactor) requiere un test nuevo o actualizado en la misma tarea.
- Todo plan debe incluir criterios de aceptación en formato falsable (Given/When/Then o checklist). El cierre de tarea debe mapear cada CA → test que lo cubre.
- Todos los commits deben ser aprobados por el usuario antes de ser ejecutados (ver también "Reglas de seguridad").

## Arquitectura actual

### Frontend

- **Entry point**: `index.html` → `src/main.tsx` → `src/App.tsx`
- **Router**: SPA casero vía `useSyncExternalStore` (sin React Router). Detecta `/checkout` para mostrar `CheckoutPage`, sino `ShopPage`.
- **ShopPage**: maneja dos vistas con estado local (`view: 'home' | 'shop'`):
  - `home`: Header + Hero + BannerServices + BrandSection + Footer
  - `shop`: Header + ProductsSection + Footer
- **Estado global**: React Context (`CartContext`, `AuthContext`) + persistencia en `localStorage`.

> Árbol de componentes referencial en `docs/architecture/component-tree.md` (puede no estar 100% actualizado — confirmar con `src/`).

### Servicios (lógica pura, sin JSX)

| Servicio | Responsabilidad |
|---|---|
| `productService.ts` | fetchProducts, filterByCategory, searchByName |
| `cartService.ts` | validarProductoRepetido, eliminarProductoCarrito, vaciarCarrito, actualizarTotal, persistencia localStorage |
| `checkoutService.ts` | detectCardType, validarLuhn, calcularTotalConInteres, calcularEnvio, calcularResumen |
| `authService.ts` | login/logout, load/save/clearAuthState en localStorage |
| `api.ts` | Configuración de URLs base (`BASE_URL`, `PRODUCTS_API_URL`) |

### Hooks

| Hook | Uso |
|---|---|
| `useCatalog.ts` | Carga productos desde API, expone products/loading/error |
| `useCart.ts` | Lógica del carrito (add, remove, clear, count) |
| `useAuth.ts` | Estado de autenticación, login/logout |

### Tipos compartidos (`src/types/`)

`product.ts`, `cart.ts`, `auth.ts`, `user.ts`, `order.ts`, `index.ts`, `jspdf.d.ts`

## Datos

- `data/db.json` — 17 productos en formato json-server (`{"products": [...]}`).
- La app React los carga directamente vía `fetch` a `/data/db.json`.
- Para usar json-server: `npm run mock:api` y cambiar `BASE_URL` en `src/services/api.ts`.

## Backend real

- En `server/` — Express + TypeScript + SQLite (sql.js).
- Arranque: `npm run server` (puerto 4000).
- Seed automático desde `data/db.json` si la tabla `products` está vacía.
- Endpoints: `GET /products`, `POST /users`, `POST /orders`, `GET /orders?userId=:id`.

## Testing

- **Unitarios/integración**: Vitest + jsdom. 70 tests en 5 suites.
  - `npm test` — ejecuta todos.
  - `npm run test:watch` — modo watch.
- **E2E**: Playwright. 14 tests en 4 suites.
  - `npm run test:e2e` — levanta Vite + corre tests.
- Cualquier agente que toque `src/` DEBE correr `npm test` antes de dar la tarea por terminada.

## Dónde escribe cada agente sus entregables

- `docs/architecture/` — mapas de dependencias, decisiones de arquitectura (ADRs).
- `docs/reports/auditor/` — reportes de deuda técnica.
- `docs/reports/qa/` — cobertura, tests agregados, flakiness.
- `docs/archive/` — documentación de fases anteriores e histórico de agentes.

## Reglas de seguridad

- Nunca commitear credenciales, API keys ni `.env`.
- Nunca hacer `git push --force` ni reescribir historia sin pedir confirmación explícita.
- Cambios en `main`/`master` van por rama + PR, nunca commit directo.
- **Todos los commits deben ser aprobados por el usuario antes de ser ejecutados.**

## Skills disponibles (ver `.opencode/skill/`)

- `testing-workflow` — configuración y ejecución de Vitest/Playwright.
- `rag-product-catalog` — indexar catálogo para shopping assistant (RAG/function calling).
- `coding-standards` — reglas de estilo detalladas (naming, estructura de carpetas `src/`).
