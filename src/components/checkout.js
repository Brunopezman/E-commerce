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
    const inputTarjeta = document.getElementById('cc-number');
    const resumenTarjeta = document.getElementById('tarjeta-resumen');
    const logoVisa = document.getElementById('logo-visa');
    const logoMaster = document.getElementById('logo-mastercard');
    const logoAmex = document.getElementById('logo-amex');

    let tarjetaValida = false;

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    console.log("Datos recuperados en checkout:", carrito);
    
    const userEmail = localStorage.getItem('userEmail') || "usuario_simulado@mail.com";
    let totalBase = 0;

    if (carrito.length === 0) {
        resumenLista.innerHTML = '<li class="list-group-item">El carrito está vacío</li>';
    } else {
        resumenLista.innerHTML = ''; 
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

    let totalConInteres = totalBase;
    let currentCuotas = parseInt(cuotasSelect.value) || 1;

    const calcularEnvio = (baseWithInterest = totalConInteres, cuotas = currentCuotas) => {
        const envioSelect = document.getElementById('envio-select');
        const resumenEnvioEl = document.getElementById('resumen-envio');

        const envioCost = envioSelect ? Number(envioSelect.value) : 0;

        if (resumenEnvioEl) resumenEnvioEl.innerText = `$${envioCost.toFixed(2)}`;

        const totalFinal = (baseWithInterest || 0) + (envioCost || 0);
        const cuotasCount = cuotas || 1;
        const valorDeCuota = totalFinal / cuotasCount;

        if (valorCuotaTxt) valorCuotaTxt.innerText = `${cuotasCount} cuota(s) de $${valorDeCuota.toFixed(2)} `;
        if (resumenTotal) resumenTotal.innerText = `$${totalFinal.toFixed(2)}`;
    };

    const actualizarCalculoCuotas = () => {
        const cuotas = parseInt(cuotasSelect.value) || 1;
        currentCuotas = cuotas;
        let factorInteres = 1;

        if (cuotas === 3) factorInteres = 1.10; // 10% interés
        if (cuotas === 6) factorInteres = 1.15; // 15% interés

        totalConInteres = totalBase * factorInteres;

        // calcularEnvio se encarga de actualizar resumenTotal y valor de cuota
        calcularEnvio(totalConInteres, cuotas);
    };

    cuotasSelect.addEventListener('change', actualizarCalculoCuotas);
    actualizarCalculoCuotas(); // Cálculo inicial
    // Recalcular cuando cambie el tipo de envío
    const envioSelectEl = document.getElementById('envio-select');
    if (envioSelectEl) envioSelectEl.addEventListener('change', () => calcularEnvio(totalConInteres, currentCuotas));

    const mostrarErrorTarjeta = () => {
        Toastify({
            text: "⚠️ Tarjeta inválida: Debe ser VISA, Mastercard o American Express. Verificá los datos e intentá nuevamente.",
            duration: 5000,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to right, #ff5f6d, #ffc371)",
                color: "white",
                fontWeight: "bold",
                borderRadius: "10px",
                boxShadow: "rgba(0, 0, 0, 0.2) 0px 5px 15px"
            }
        }).showToast();
    };

    const detectarTarjeta = (numero) => {
        if (/^4\d{15}$/.test(numero)) return "VISA";
        if (/^5[1-5]\d{14}$/.test(numero)) return "MASTERCARD";
        if (/^(34|37)\d{13}$/.test(numero)) return "AMERICAN EXPRESS";
        return null;
    };

    formPago.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!tarjetaValida) {
            mostrarErrorTarjeta();
            return;
        }

        Toastify({ 
            text: "Procesando pago...", 
            style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } 
        }).showToast();

        setTimeout(() => {
            seccionPago.style.display = 'none';
            seccionExito.style.display = 'block';

            localStorage.removeItem('carrito');

            let cuentaRegresiva = 15;
            const intervalo = setInterval(() => {
                cuentaRegresiva--;
                timerTxt.innerText = cuentaRegresiva;
                if (cuentaRegresiva <= 0) {
                    clearInterval(intervalo);
                    window.location.href = '../index.html';
                }
            }, 1000);
        }, 2000);
    });

    btnDescargar.addEventListener('click', () => {
        const nroTarjeta = inputTarjeta.value;
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

    const ocultarLogos = () => {
        [logoVisa, logoMaster, logoAmex].forEach(logo => {
            logo.classList.add('d-none');
            logo.classList.remove('activa');
        });
    };

    const mostrarLogo = (marca) => {
        ocultarLogos();

        if (marca === 'VISA') {
            logoVisa.classList.remove('d-none');
            logoVisa.classList.add('activa');
        }

        if (marca === 'MASTERCARD') {
            logoMaster.classList.remove('d-none');
            logoMaster.classList.add('activa');
        }

        if (marca === 'AMERICAN EXPRESS') {
            logoAmex.classList.remove('d-none');
            logoAmex.classList.add('activa');
        }
    };

    const validarLuhn = (numero) => {
        let suma = 0;
        let alternar = false;

        for (let i = numero.length - 1; i >= 0; i--) {
            let n = parseInt(numero[i], 10);

            if (alternar) {
                n *= 2;
                if (n > 9) n -= 9;
            }

            suma += n;
            alternar = !alternar;
        }

        return suma % 10 === 0;
    };

    const formatearNumeroTarjeta = (numero, marca) => {
        if (marca === 'AMERICAN EXPRESS') {
            return numero
                .replace(/^(\d{4})(\d{6})(\d{0,5}).*/, '$1 $2 $3')
                .trim();
        }

        return numero
            .replace(/(\d{4})/g, '$1 ')
            .trim();
    };

    const marcarTarjetaInvalida = () => {
        inputTarjeta.classList.add('is-invalid');
        ocultarLogos();
        resumenTarjeta.innerText = '—';
    };

    const marcarTarjetaValida = (marca, numero) => {
        inputTarjeta.classList.remove('is-invalid');
        resumenTarjeta.innerText = `${marca} •••• ${numero.slice(-4)}`;
        mostrarLogo(marca);
    };


    inputTarjeta.addEventListener('input', () => {
        const raw = inputTarjeta.value.replace(/\D/g, '');

        const marca = detectarTarjeta(raw);
        tarjetaValida = false;

        if (!marca) {
            marcarTarjetaInvalida();
            inputTarjeta.value = raw;
            return;
        }

        const numeroFormateado = formatearNumeroTarjeta(raw, marca);
        inputTarjeta.value = numeroFormateado;

        if (!validarLuhn(raw)) {
            marcarTarjetaInvalida();
            return;
        }

        tarjetaValida = true;
        marcarTarjetaValida(marca, raw);
    });
});




