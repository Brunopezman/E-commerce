---
name: coding-standards
description: Reglas de estilo y estructura de carpetas del proyecto (React + TypeScript + Vite + Tailwind). Usar cuando cualquier agente esté por crear o mover archivos en src/ y tenga dudas de dónde va cada cosa.
---

# Coding standards — React + TypeScript + Vite + Tailwind

## Estructura de `src/`
```
src/
  components/
    admin/
      AdminPanel.tsx
    auth/
      LoginModal.tsx
      LogoutConfirmModal.tsx
      RegisterPage.tsx
    cart/
      CartItemRow.tsx
      CartModal.tsx
    catalog/
      FilterSidebar.tsx
      ProductCard.tsx
      ProductDetailPage.tsx
      ProductGrid.tsx
      ProductsSection.tsx
    checkout/
      CheckoutPage.tsx
    home/
      BannerServices.tsx
      BrandSection.tsx
      HeroSection.tsx
    layout/
      AppContent.tsx
      FaqSection.tsx
      Footer.tsx
      Header.tsx
      ShopPage.tsx
    router/
      ProductDetailRoute.tsx
      Router.tsx
    ui/                 # componentes genéricos reutilizables (Button, Modal, etc.)
      ProductCard.tsx
      Toast.tsx
  hooks/
    useAuth.ts
    useCart.ts
    useCatalog.ts
    useToast.ts
  services/
    api.ts              # cliente HTTP tipado (fetch a la mock API / backend real)
    authService.ts      # funciones puras de lógica de autenticación
    cartService.ts      # funciones puras de lógica del carrito
    checkoutService.ts  # funciones puras de lógica de checkout
    productService.ts   # funciones puras de lógica de catálogo
    router.ts           # lógica de ruteo SPA
    userService.ts      # lógica de administración de usuarios
  types/
    auth.ts
    cart.ts
    order.ts
    product.ts
    user.ts
  context/
    AuthContext.tsx
    CartContext.tsx
  App.tsx
  main.tsx
```

## Naming
- Componentes: PascalCase, un componente por archivo (`ProductCard.tsx`).
- Hooks: camelCase con prefijo `use` (`useCart.ts`).
- Types/interfaces: PascalCase, sufijo opcional según convenga (`Product`, `CartItem`).
- Archivos que no son componentes (services, utils): camelCase consistente dentro de la carpeta.

## Reglas TypeScript
- `strict: true` en `tsconfig.json`, sin excepciones.
- Nada de `any`; si hace falta un escape hatch, usar `unknown` + narrowing, y comentar por qué.
- Los tipos de datos que vienen de la API (`Product`, `Order`, etc.) viven en `src/types/`
  y son la fuente de verdad — no redefinir shapes ad-hoc en cada componente.

## Reglas React
- Componentes funcionales únicamente, con hooks.
- Lógica de negocio (cálculos, validaciones, reglas del carrito) fuera del JSX: en hooks
  custom o en `src/services/`. Un componente no debería tener más de una o dos líneas de
  lógica no-trivial antes del `return`.
- Props tipadas explícitamente con `interface` o `type`, nunca `React.FC` sin motivo
  (preferí tipar props + retorno implícito de JSX.Element).
- Evitar prop drilling de más de 2 niveles: usar Context (`src/context/`) para estado
  compartido como carrito o sesión de usuario.

## Estilos (Tailwind)
- Utility classes directo en el JSX.
- Si una combinación de clases se repite en 3+ lugares, extraer a un componente en
  `components/ui/`, no a una clase custom en CSS.
- Nada de estilos inline (`style={{...}}`) salvo valores verdaderamente dinámicos
  (ej. un `width` calculado en runtime).
