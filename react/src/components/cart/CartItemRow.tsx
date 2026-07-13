import type { CartItem } from '../../types/cart';

interface CartItemRowProps {
  item: CartItem;
  onRemove: (id: number | string) => void;
}

export function CartItemRow({ item, onRemove }: CartItemRowProps) {
  return (
    <div className="productoEnCarrito d-flex align-items-center gap-3 border-bottom py-3">
      <p className="col-3 mb-0">{item.nombre}</p>
      <p className="col-3 mb-0">Precio: ${item.precio}</p>
      <p className="col-3 mb-0" id={`cantidad${item.id}`}>
        Cantidad: {item.cantidad}
      </p>
      <button
        id="btn-eliminar"
        className="btn btn-sm btn-outline-danger boton-eliminar bx bx-x"
        value={item.id}
        onClick={() => onRemove(item.id)}
      />
    </div>
  );
}
