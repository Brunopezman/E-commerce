import type { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick?: (id: number) => void;
}

export function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  const stock = product.stock ?? 0;
  const outOfStock = stock === 0;
  const lowStock = stock > 0 && stock <= 3;

  return (
    <div className="product text-center mb-4">
      <div
        className="cursor-pointer"
        onClick={() => onProductClick?.(product.id)}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onProductClick?.(product.id);
          }
        }}
        aria-label={`Ver detalle de ${product.nombre}`}
      >
        <img
          id={`product-img-${product.id}`}
          className="img-fluid mb-3 w-full h-48 object-cover object-center"
          src={product.img}
          alt={product.descripcion ?? product.nombre}
        />
        <h5 className="product-name font-display">{product.nombre}</h5>
      </div>
      <div className="star">
        {[...Array(5)].map((_, i) => (
          <i key={i} className="bx bxs-star" />
        ))}
      </div>
      <h4 className="product-price font-display">${product.precio}</h4>
      {outOfStock ? (
        <span className="inline-block text-xs font-display uppercase text-red-600 font-bold tracking-wide mt-1">
          Sin stock
        </span>
      ) : lowStock ? (
        <span className="inline-block text-xs font-display text-amber-600 font-bold tracking-wide mt-1">
          Solo quedan {stock}
        </span>
      ) : (
        <span className="inline-block text-xs font-display text-green-600 font-bold tracking-wide mt-1">
          En stock ({stock})
        </span>
      )}
      <button
        id={`${product.id}`}
        className={`buy-btn bx bx-cart-add bx-sm agregar text-white border-none font-bold uppercase text-sm px-7 py-3 cursor-pointer rounded ${outOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !outOfStock && onAddToCart(product)}
        disabled={outOfStock}
        aria-label={outOfStock ? `${product.nombre} sin stock` : `Agregar ${product.nombre} al carrito`}
      />
    </div>
  );
}
