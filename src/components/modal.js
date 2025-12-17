// Modal (con defensas para elementos opcionales)
document.addEventListener('DOMContentLoaded', () => {
    const modalContenedor = document.querySelector('.modal-contenedor');
    const abrirCarrito = document.getElementById('tienda');
    const cerrarCarrito = document.getElementById('btn-cerrar-carrito');
    const modalCarrito = document.querySelector('.modal-carrito');

    if (abrirCarrito) {
        abrirCarrito.addEventListener('click', () => {
            if (modalContenedor) modalContenedor.classList.toggle('modal-active');
        });
    }

    if (cerrarCarrito) {
        cerrarCarrito.addEventListener('click', () => {
            if (modalContenedor) modalContenedor.classList.toggle('modal-active');
        });
    }

    if (modalContenedor && cerrarCarrito) {
        modalContenedor.addEventListener('click', () => {
            cerrarCarrito.click();
        });
    }

    if (modalCarrito) {
        modalCarrito.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target && e.target.classList && e.target.classList.contains('boton-eliminar')) {
                if (typeof eliminarProductoCarrito === 'function') eliminarProductoCarrito(e.target.value);
            }
        });
    }
});