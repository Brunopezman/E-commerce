// Cart module: encapsula la lógica del carrito y expone funciones globales
(function(){
  window.carrito = window.carrito || [];

  window.guardarCarritoStorage = (carritoData) => {
    localStorage.setItem('carrito', JSON.stringify(carritoData));
  };

  window.obtenerCarritoStorage = () => {
    try {
      return JSON.parse(localStorage.getItem('carrito')) || [];
    } catch (e) {
      return [];
    }
  };

  window.pintarTotalCarrito = (totalCantidad, totalCompra) => {
    const contadorCarrito = document.getElementById('contador-carrito');
    const precioTotal = document.getElementById('precioTotal');
    if (contadorCarrito) contadorCarrito.innerText = totalCantidad;
    if (precioTotal) precioTotal.innerText = totalCompra;
  };

  window.actualizarTotalCarrito = (carritoData) => {
    const totalCantidad = (carritoData || window.carrito).reduce((acc, item) => acc + item.cantidad, 0);
    const totalCompra = (carritoData || window.carrito).reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    window.pintarTotalCarrito(totalCantidad, totalCompra);
    window.guardarCarritoStorage(window.carrito);
  };

  window.pintarProductoCarrito = (producto) => {
    const carritoContenedor = document.getElementById('carrito-contenedor');
    if (!carritoContenedor) return;
    const div = document.createElement('div');
    div.classList.add('productoEnCarrito');
    div.innerHTML = `
    <p class="py-3 col-3">${producto.nombre}</p>
    <p class="py-3 col-3">Precio: $${producto.precio}</p>
    <p class="py-3 col-3" id=cantidad${producto.id}>Cantidad: ${producto.cantidad}</p>
    <button id="btn-eliminar" class="pb-4 btn waves-effect waves-ligth boton-eliminar bx bx-x" value="${producto.id}"></button>
    `;
    carritoContenedor.appendChild(div);
    div.addEventListener('click', () => {
      Toastify({ text: "Producto eliminado!", duration: 1500, offset: { x:20,y:100 }, style:{ background: 'rgb(245, 146, 109)', color:'white' } }).showToast();
    });
  };

  window.actualizarCarrito = (carritoData) => {
    const contenedor = document.getElementById('carrito-contenedor');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    (carritoData || window.carrito).forEach(producto => {
      const div = document.createElement('div');
      div.classList.add('productoEnCarrito');
      div.innerHTML += `
            <p class="py-3 col-3">${producto.nombre}</p>
            <p class="py-3 col-3">Precio: ${producto.precio}</p>
            <p class="py-3 col-3" id=cantidad${producto.id}>Cantidad: ${producto.cantidad}</p>
            <button id="btn-eliminar" class="pb-4 btn waves-effect waves-ligth boton-eliminar bx bx-x" value="${producto.id}"></button>
        `;
      contenedor.appendChild(div);
      div.addEventListener('click', () => {
        Toastify({ text: "Producto eliminado!", duration: 1500, offset: { x:20,y:100 }, style:{ background: 'rgb(245, 146, 109)', color:'white' } }).showToast();
      });
    });
  };

  window.alertaCarritoVacio = () => {
    Toastify({ text: "Carrito vacío!", duration: 1500, offset: { x:20,y:100 }, style:{ background: 'rgb(245, 146, 109)', color:'white' } }).showToast();
  };

  window.eliminarProductoCarrito = (productoId) => {
    const productoIndex = window.carrito.findIndex(p => p.id == productoId);
    if (productoIndex === -1) return;
    if (window.carrito[productoIndex].cantidad === 1) {
      window.carrito.splice(productoIndex, 1);
      window.actualizarCarrito(window.carrito);
      window.actualizarTotalCarrito(window.carrito);
    } else {
      window.carrito[productoIndex].cantidad--;
      window.actualizarCarrito(window.carrito);
      window.actualizarTotalCarrito(window.carrito);
    }
  };

  window.vaciarCarrito = () => {
    window.carrito = [];
    localStorage.removeItem('carrito');
    window.alertaCarritoVacio();
    window.actualizarTotalCarrito(window.carrito);
    window.actualizarCarrito(window.carrito);
  };

  window.validarProductoRepetido = (e, productos) => {
    const id = e.target.id;
    const productoRepetido = window.carrito.find(producto => producto.id == id);
    if (!productoRepetido) {
      const producto = productos.find(producto => producto.id == id);
      if (!producto) return;
      producto.cantidad = 1;
      window.carrito.push(producto);
      window.pintarProductoCarrito(producto);
      window.guardarCarritoStorage(window.carrito);
      window.actualizarTotalCarrito(window.carrito);
    } else {
      productoRepetido.cantidad++;
      const cantidadProducto = document.getElementById(`cantidad${productoRepetido.id}`);
      if (cantidadProducto) cantidadProducto.innerText = `Cantidad: ${productoRepetido.cantidad}`;
      window.actualizarTotalCarrito(window.carrito);
    }
  };

  // Event listeners guarded by existence
  document.addEventListener('DOMContentLoaded', () => {
    const carritoVacioBtn = document.getElementById('vaciarCarrito');
    if (carritoVacioBtn) carritoVacioBtn.addEventListener('click', window.vaciarCarrito);

    // If there's saved carrito, restore
    if (localStorage.getItem('carrito')) {
      window.carrito = window.obtenerCarritoStorage() || [];
      window.actualizarCarrito(window.carrito);
      window.actualizarTotalCarrito(window.carrito);
    }

    // delegate remove button clicks
    document.addEventListener('click', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('boton-eliminar')) {
        window.eliminarProductoCarrito(e.target.value);
      }
    });
  });

})();
