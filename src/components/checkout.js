document.addEventListener('DOMContentLoaded', () => {
    // 1. Referencias a elementos del DOM
    const resumenLista = document.getElementById('resumen-lista');
    const resumenTotal = document.getElementById('resumen-total');
    const cuotasSelect = document.getElementById('cuotas-select');
    const valorCuotaTxt = document.getElementById('valor-cuota');
    const formPago = document.getElementById('form-pago');
    const seccionPago = document.getElementById('seccion-pago');
    const seccionExito = document.getElementById('seccion-exito');
    const timerTxt = document.getElementById('timer');
    const btnDescargar = document.getElementById('btn-descargar-pdf');

    // 2. Obtener datos del localStorage
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    console.log("Datos recuperados en checkout:", carrito);
    const userEmail = localStorage.getItem('userEmail') || "usuario_simulado@mail.com";
    let totalBase = 0;

    // 3. Renderizar el resumen de compra
    if (carrito.length === 0) {
        resumenLista.innerHTML = '<li class="list-group-item">El carrito está vacío</li>';
    } else {
        carrito.forEach(prod => {
            const subtotal = prod.precio * prod.cantidad;
            totalBase += subtotal;
            const li = document.createElement('li');
            li.className = "list-group-item d-flex justify-content-between lh-sm";
            li.innerHTML = `
                <div>
                    <h6 class="my-0">${prod.nombre}</h6>
                    <small class="text-muted">Cantidad: ${prod.cantidad}</small>
                </div>
                <span class="text-muted">$${subtotal.toFixed(2)}</span>
            `;
            resumenLista.appendChild(li);
        });
        resumenTotal.innerText = `$${totalBase.toFixed(2)}`;
    }

    // 4. Lógica de Cuotas e Intereses
    const actualizarCalculoCuotas = () => {
        const cuotas = parseInt(cuotasSelect.value);
        let factorInteres = 1;

        if (cuotas === 3) factorInteres = 1.10; // 10% interés
        if (cuotas === 6) factorInteres = 1.15; // 15% interés

        const totalConInteres = totalBase * factorInteres;
        const valorDeCuota = totalConInteres / cuotas;

        valorCuotaTxt.innerText = `${cuotas} cuota(s) de $${valorDeCuota.toFixed(2)} `;
        resumenTotal.innerText = `$${totalConInteres.toFixed(2)}`;
    };

    cuotasSelect.addEventListener('change', actualizarCalculoCuotas);
    actualizarCalculoCuotas(); // Cálculo inicial

    // 5. Simulación de Pago y envío de "Mail"
    formPago.addEventListener('submit', (e) => {
        e.preventDefault();

        // Simulamos una demora de red
        Toastify({ text: "Procesando pago...", style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } }).showToast();

        setTimeout(() => {
            console.log(`SIMULACIÓN: Enviando comprobante a ${userEmail}`);
            
            // Ocultar pago, mostrar éxito
            seccionPago.style.display = 'none';
            seccionExito.style.display = 'block';

            // Limpiar el carrito de la base de datos local
            // En checkout.js, dentro del setTimeout del submit:
            localStorage.removeItem('carrito');
            if (window.vaciarCarrito) {
                window.vaciarCarrito(); // Esto asegura que la variable 'window.carrito' también se limpie
            }

            // Iniciar cuenta regresiva para redirección
            let cuentaRegresiva = 15;
            const intervalo = setInterval(() => {
                cuentaRegresiva--;
                timerTxt.innerText = cuentaRegresiva;
                if (cuentaRegresiva <= 0) {
                    clearInterval(intervalo);
                    window.location.href = 'index.html'; // O shop.html
                }
            }, 1000);
        }, 2000);
    });

    // 6. Generar Comprobante (TXT/PDF simulado)
    btnDescargar.addEventListener('click', () => {
        const nroTarjeta = document.getElementById('cc-number').value;
        const nombreTitular = document.getElementById('cc-name').value;
        
        const contenidoComprobante = `
            ====================================
            COMPROBANTE DE PAGO - RMR
            ====================================
            Fecha: ${new Date().toLocaleString()}
            Cliente: ${nombreTitular}
            Email: ${userEmail}
            Tarjeta: **** **** **** ${nroTarjeta.slice(-4)}
            ------------------------------------
            Total Pagado: ${resumenTotal.innerText}
            Cuotas: ${cuotasSelect.value}
            ------------------------------------
            ¡Gracias por su compra!
            ====================================
        `;

        const blob = new Blob([contenidoComprobante], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Comprobante_RMR_${Date.now()}.txt`;
        a.click();
    });
});