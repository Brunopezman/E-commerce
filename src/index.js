document.addEventListener('DOMContentLoaded', () => {
    const defaultUrl = '../data/stock.json';

    const resolveConfigUrl = () => {
        if (typeof window === 'undefined' || !window.Config || !window.Config.DATA_URL) return null;
        try {
            // Resolve relative/absolute URL against current location
            return new URL(window.Config.DATA_URL, window.location.href).href;
        } catch (e) {
            return window.Config.DATA_URL;
        }
    };

    const tryLoad = async () => {
        const configUrl = resolveConfigUrl();
        const svc = (window.ProductsService && typeof window.ProductsService.fetchProducts === 'function') ? window.ProductsService.fetchProducts : (u => fetch(u).then(r => r.json()).catch(() => []));

        // First try configured URL (if any)
        if (configUrl) {
            const data = await svc(configUrl);
            if (Array.isArray(data) && data.length > 0) {
                if (window.pintarProductos) window.pintarProductos(data);
                return;
            }
            // If failed or empty, fallthrough to default
            console.warn('Falling back to default data URL:', defaultUrl);
        }

        // Final attempt with default relative path
        const fallbackData = await svc(defaultUrl);
        if (window.pintarProductos) window.pintarProductos(fallbackData);
    };

    tryLoad();
    
    if (localStorage.getItem('carrito')) {
       
        carrito = obtenerCarritoStorage();
        actualizarCarrito(carrito);
        actualizarTotalCarrito(carrito);
    }
});

