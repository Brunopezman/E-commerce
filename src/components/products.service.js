// Products service: fetch y filtros de productos
(function(){
  const fetchProducts = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('ProductsService.fetchProducts error:', err);
      return [];
    }
  };

  const filterByCategory = (products, category) => {
    if (!category) return products;
    return products.filter(p => String(p.categoria || p.category || '').toLowerCase() === String(category).toLowerCase());
  };

  const searchByName = (products, term) => {
    if (!term) return products;
    const q = term.trim().toLowerCase();
    return products.filter(p => (p.nombre || p.name || '').toLowerCase().includes(q));
  };

  window.ProductsService = {
    fetchProducts,
    filterByCategory,
    searchByName
  };

})();
