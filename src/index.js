document.addEventListener('DOMContentLoaded', () => {
    const defaultUrl = '../data/stock.json';
    const url = (typeof window !== 'undefined' && window.Config && window.Config.DATA_URL) ? window.Config.DATA_URL : defaultUrl;

    if (window.ProductsService && typeof window.ProductsService.fetchProducts === 'function') {
        window.ProductsService.fetchProducts(url).then(data => {
            if (window.pintarProductos) window.pintarProductos(data);
        });
    } else {
        // Fallback al fetch directo si el service no está presente
        fetch(url).then(res => res.json()).then(data => { if (window.pintarProductos) window.pintarProductos(data); });
    }
    
    if (localStorage.getItem('carrito')) {
       
        carrito = obtenerCarritoStorage();
        actualizarCarrito(carrito);
        actualizarTotalCarrito(carrito);
    }
});

