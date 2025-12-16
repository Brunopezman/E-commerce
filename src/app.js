
// Pintar productos en el shop
const pintarProductos = (data) => { 
    const productosDestacados = document.getElementById('productosDestacados');    
    
    data.forEach(producto => {
        const div = document.createElement('div');
        div.classList.add('product', 'text-center', 'col-lg-3', 'col-md-4', 'col-12');
        div.innerHTML += `         
            <img id="${producto.id}" class="img-fluid mb-3" src="${producto.img}" alt="${producto.descripcion}"> 
            <div class="star">
                <i class='bx bxs-star warning' ></i>
                <i class='bx bxs-star warning' ></i>
                <i class='bx bxs-star warning' ></i>
                <i class='bx bxs-star warning' ></i>
                <i class='bx bxs-star warning' ></i>
            </div>
            <h5 class="product-name">${producto.nombre}</h5>
            <h4 class="product price">$${producto.precio}</h4>
        
            <button id="${producto.id}" class="buy-btn bx bx-cart-add bx-sm agregar"></button>
        `
        productosDestacados.appendChild(div);
        
    })    
    
    const btnComprar = document.querySelectorAll('.buy-btn');
    btnComprar.forEach(el => {
        el.addEventListener('click', (e) => validarProductoRepetido(e, data))
    })
};

// array de productos
let carrito = [];

// Validar que un producto esté repetido
const validarProductoRepetido = (e, productos) => {
    let id = e.target.id;
    console.log(id)
    const productoRepetido = carrito.find(producto => producto.id == id);

    if (!productoRepetido) {
        // Agregar los productos al carrito que no esten repetidos
        const producto = productos.find(producto => producto.id == id);
        carrito.push(producto);
        pintarProductoCarrito(producto);
        guardarCarritoStorage(carrito);
        actualizarTotalCarrito(carrito);
    } else {
        // Aumentar la cantidad de un producto que ya se encuentre en el carrito
        productoRepetido.cantidad++
        const cantidadProducto = document.getElementById(`cantidad${productoRepetido.id}`);
        cantidadProducto.innerText = `Cantidad: ${productoRepetido.cantidad}`
        actualizarTotalCarrito(carrito);
    }
};

// Mostrar los productos dentro del carrito
const pintarProductoCarrito = (producto) => {
    const carritoContenedor = document.getElementById('carrito-contenedor');
    const div = document.createElement('div');
    div.classList.add('productoEnCarrito');
    div.innerHTML = `
    <p class="py-3 col-3">${producto.nombre}</p>
    <p class="py-3 col-3">Precio: $${producto.precio}</p>
    <p class="py-3 col-3" id=cantidad${producto.id}>Cantidad: ${producto.cantidad}</p>
    <button id="btn-eliminar" class="pb-4 btn waves-effect waves-ligth boton-eliminar bx bx-x" value="${producto.id}"></button>
    `
    carritoContenedor.appendChild(div);

    div.addEventListener('click', alertaProductoEliminado);
};

// Eliminar productos del carrito
const eliminarProductoCarrito = (productoId) => {
    const productoIndex = carrito.findIndex(producto => producto.id == productoId);

    if (carrito[productoIndex].cantidad === 1) {
        carrito.splice(productoIndex, 1);
        actualizarCarrito(carrito);
        actualizarTotalCarrito(carrito);
    } else {
        carrito[productoIndex].cantidad--
        actualizarCarrito(carrito);
        actualizarTotalCarrito(carrito);
    }
};

// Vaciar el carrito
const vaciarCarrito = () => {
    carrito = [];

    localStorage.removeItem('Carrito', JSON.stringify(carrito))
    alertaCarritoVacío();
    actualizarTotalCarrito(carrito);
    actualizarCarrito();
}

const carritoVacio = document.getElementById('vaciarCarrito');
carritoVacio.addEventListener('click', vaciarCarrito)

// Alerta cada vez que elimino un producto
const alertaProductoEliminado = () => {
    
    Toastify({
        text: "Producto eliminado!",
        duration: 1500,
        offset: {
            x: 20,
            y: 100 
        },
        style: {
            background: 'rgb(245, 146, 109)',
            color: 'white',
        }
    }).showToast();   
};

// Alerta cada vez que Vacío el carrito
const alertaCarritoVacío = () => {
    
    Toastify({
        text: "Carrito vacío!",
        duration: 1500,
        offset: {
            x: 20,
            y: 100 
        },
        style: {
            background: 'rgb(245, 146, 109)',
            color: 'white',
        }
    }).showToast();   
};

// Actualizar los productos dentro del carrito
const actualizarCarrito = (carrito) => {
    const contenedor = document.getElementById('carrito-contenedor');

    contenedor.innerHTML = '';

    carrito.forEach(producto => {
        const div = document.createElement('div');
        div.classList.add('productoEnCarrito');
        div.innerHTML += `
            <p class="py-3 col-3">${producto.nombre}</p>
            <p class="py-3 col-3">Precio: ${producto.precio}</p>
            <p class="py-3 col-3" id=cantidad${producto.id}>Cantidad: ${producto.cantidad}</p>
            <button id="btn-eliminar" class="pb-4 btn waves-effect waves-ligth boton-eliminar bx bx-x" value="${producto.id}"></button>
        `
        contenedor.appendChild(div);

        div.addEventListener('click', alertaProductoEliminado);
    });
};


// Storage de productos 
const guardarCarritoStorage = (carrito) => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
};

const obtenerCarritoStorage = () => {
    const carritoStorage = JSON.parse(localStorage.getItem('carrito'));
    return carritoStorage;
};

// Actualizar el total de productos en el carrito
const actualizarTotalCarrito = (carrito) => {
    const totalCantidad = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const totalCompra = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    pintarTotalCarrito(totalCantidad, totalCompra);
    guardarCarritoStorage(carrito);
};

// Mostrar la cantidad y el precio total de la compra
const pintarTotalCarrito = (totalCantidad, totalCompra) => {
    const contadorCarrito = document.getElementById('contador-carrito');
    const precioTotal = document.getElementById('precioTotal');

    contadorCarrito.innerText = totalCantidad;
    precioTotal.innerText = totalCompra;
}; 


// =======================================================
// === MÓDULO DE AUTENTICACIÓN (LOGIN) ===
// =======================================================

// 1. Alerta de Inicio de Sesión Exitosa
const alertaLoginExitoso = (email) => {
    Toastify({
        text: `¡Bienvenido, ${email.split('@')[0]}!`,
        duration: 2500,
        offset: {
            x: 20,
            y: 100 
        },
        style: {
            background: 'green', // Usamos verde para éxito
            color: 'white',
        }
    }).showToast();
};

// 2. Alerta de Error de Credenciales
const alertaLoginError = () => {
    Toastify({
        text: "Error de credenciales. Por favor, revisa tu email y contraseña.",
        duration: 3000,
        offset: {
            x: 20,
            y: 100 
        },
        style: {
            background: 'red', // Usamos rojo para error
            color: 'white',
        }
    }).showToast();
};

// 3. Manejo del Evento Submit del Formulario
const manejarLogin = (e) => {
    // IMPEDIR ENVÍO POR DEFECTO: Evita que la página se recargue
    e.preventDefault(); 
    
    // Obtener los elementos del formulario (usando los IDs del HTML del modal)
    const form = e.target;
    const emailInput = document.getElementById('inputEmail');
    const passwordInput = document.getElementById('inputPassword');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validación Mínima (simulación)
    // En un entorno real, esta data se enviaría a un servidor (fetch/axios) para autenticación.
    
    if (email === "test@mail.com" && password === "1234") {
        
        // --- SIMULACIÓN DE LOGIN EXITOSO ---
        
        // 1. Mostrar Toastify de bienvenida
        alertaLoginExitoso(email); 
        
        // 2. Cerrar el modal de Bootstrap
        // Necesitamos obtener la instancia del modal y llamar al método hide()
        const userModalElement = document.getElementById('userModal');
        const userModal = bootstrap.Modal.getInstance(userModalElement); // Obtiene la instancia ya inicializada por Bootstrap
        
        if (userModal) {
             userModal.hide();
        } 
        
        // 3. Limpiar los campos del formulario
        form.reset(); 
        
    } else {
        
        // --- SIMULACIÓN DE LOGIN FALLIDO ---
        
        // 1. Mostrar Toastify de error
        alertaLoginError();
        
        // 2. Opcional: enfocar el campo de email o contraseña
        emailInput.focus();
    }
};

// 4. Inicialización: Añadir el Event Listener al formulario
// Esta función se llama al inicio de la carga del script, igual que tus otras funciones.

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    // Comprobamos que el formulario exista antes de añadir el listener
    if (loginForm) {
        loginForm.addEventListener('submit', manejarLogin);
    }
    
    // También necesitamos la inicialización para el botón de Google (solo un placeholder)
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            Toastify({
                text: "Funcionalidad de Google Login en desarrollo. Por favor, usa el formulario clásico.",
                duration: 3000,
                offset: { x: 20, y: 100 },
                style: { background: 'blue' }
            }).showToast();
        });
    }
});