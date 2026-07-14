# Árbol de componentes (referencia rápida)

> **⚠️ Puede no estar 100% actualizado — confirmar con `src/` antes de asumir estructura.**

```
App
├── AuthProvider
│   └── CartProvider
│       └── AppContent
│           └── Router
│               ├── [path=/checkout] CheckoutPage
│               └── ShopPage
│                   ├── Header
│                   │   ├── CartModal
│                   │   └── LoginModal
│                   ├── HeroSection (solo view=home)
│                   ├── BannerServices (solo view=home)
│                   ├── BrandSection (solo view=home)
│                   └── ProductsSection (solo view=shop)
│                       └── ProductGrid
│                           └── ProductCard[]
└── Footer
```
