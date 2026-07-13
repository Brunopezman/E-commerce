import { useCart } from '../../hooks/useCart';
import { CartItemRow } from './CartItemRow';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, summary, removeItem, clearCart } = useCart();

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (items.length === 0) {
      // TODO: show toastify notification
      return;
    }
    window.location.href = '/pages/checkout.html';
  };

  return (
    <div
      className={`modal-contenedor ${isOpen ? 'modal-active' : ''}`}
      onClick={onClose}
    >
      <div className="modal-carrito" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-3">Carrito</h3>
        <button
          id="btn-cerrar-carrito"
          className="btn-close float-end"
          onClick={onClose}
        >
          <i className="bx bxs-x-circle" />
        </button>

        <div id="carrito-contenedor">
          {items.length === 0 ? (
            <p className="text-muted text-center py-4">El carrito está vacío</p>
          ) : (
            items.map((item) => (
              <CartItemRow key={item.id} item={item} onRemove={removeItem} />
            ))
          )}
        </div>

        <p className="precioProducto mt-3 fw-bold">
          Precio Total: $<span id="precioTotal">{summary.totalPrice}</span>
        </p>

        <button
          id="btn-checkout"
          className="btn btn-primary w-100 mb-2 btn-comprar"
          onClick={handleCheckout}
        >
          Finalizar Compra
        </button>

        <button
          id="vaciarCarrito"
          className="btn btn-outline-secondary w-100"
          onClick={clearCart}
        >
          Limpiar carrito
        </button>
      </div>
    </div>
  );
}
