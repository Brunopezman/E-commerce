// Auth module: maneja login/logout y actualización de UI
(function(){
  // Leer configuración global si está disponible
  const API_BASE = (typeof window !== 'undefined' && window.Config && window.Config.API_URL) ? window.Config.API_URL : null;
  // Si no hay API_BASE, dejamos el endpoint en null para forzar configuración explícita
  const API_LOGIN_ENDPOINT = API_BASE ? `${API_BASE}/api/auth/login` : null;

  // Aviso: si no hay endpoint configurado y no se usa mock, el login no funcionará.
  if (!API_LOGIN_ENDPOINT && !(typeof window !== 'undefined' && window.Config && window.Config.USE_MOCK_AUTH)) {
    console.warn('No API_LOGIN_ENDPOINT configurado. Define Config.API_URL (en src/config/env.js) o activa Config.USE_MOCK_AUTH para pruebas locales.');
  }

  const userModalElement = document.getElementById('userModal');
  const emailInput = document.getElementById('inputEmail');
  const passwordInput = document.getElementById('inputPassword');
  const loginForm = document.getElementById('loginForm');
  const logoutNavItem = document.getElementById('logout-nav-item');

  const cerrarModalUsuario = () => {
    if (typeof bootstrap !== 'undefined' && userModalElement) {
      const userModal = bootstrap.Modal.getInstance(userModalElement);
      if (userModal) userModal.hide();
    }
  }

  const alertaLoginExitoso = (email) => {
    Toastify({ text: `¡Bienvenido, ${email.split('@')[0]}!`, duration: 2500, offset:{x:20,y:100}, style:{ background: 'green', color:'white' }}).showToast();
  };

  const alertaLoginError = (mensaje) => {
    const texto = mensaje || "Error de credenciales. Por favor, revisa tu email y contraseña.";
    Toastify({ text: texto, duration: 4000, offset:{x:20,y:100}, style:{ background: 'red', color:'white' }}).showToast();
  };

  const guardarToken = (token) => {
    localStorage.setItem('authToken', token);
  };

  const manejarLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!email || !password) {
      alertaLoginError("Email y contraseña son obligatorios.");
      return;
    }

    try {
      // Si está habilitado el mock de auth en Config, usar la URL de mock
      const useMock = (typeof window !== 'undefined' && window.Config && window.Config.USE_MOCK_AUTH);
      const mockUrl = (typeof window !== 'undefined' && window.Config && window.Config.MOCK_AUTH_URL) ? window.Config.MOCK_AUTH_URL : null;
      const endpoint = useMock && mockUrl ? mockUrl : API_LOGIN_ENDPOINT;

      const opts = useMock ? { method: 'GET' } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) };

      if (!endpoint) {
        alertaLoginError('No está configurado el endpoint de autenticación. Revisa Config.API_URL o activa USE_MOCK_AUTH.');
        return;
      }

      const response = await fetch(endpoint, opts);

      // Intentar parsear JSON solo si la respuesta tiene content-type JSON
      let data;
      try {
        const ct = response.headers.get('content-type') || '';
        if (ct.toLowerCase().includes('application/json')) {
          data = await response.json();
        } else {
          // Si viene HTML o texto (p. ej. una página de error), leer como texto
          const text = await response.text();
          try {
            data = JSON.parse(text);
          } catch (e) {
            data = { msg: text };
          }
        }
      } catch (parseErr) {
        console.warn('Could not parse login response as JSON:', parseErr);
        data = { msg: 'Respuesta inesperada del servidor.' };
      }

      if (response.ok) {
        // Si es mock y no viene token, intentar leer structure
        const token = data.token || data.accessToken || null;
        if (token) guardarToken(token);
          // Guardar email para mostrar nombre de usuario en UI
          try { localStorage.setItem('userEmail', email); } catch (e) {}
        alertaLoginExitoso(email);
        cerrarModalUsuario(); form.reset();
        actualizarInterfazUsuario();
      } else {
        const errorMessage = data.msg || data.error || "Credenciales inválidas o no existen.";
        alertaLoginError(errorMessage);
        if (emailInput) emailInput.focus();
      }
    } catch (error) {
      console.warn('Login request failed (network or CORS):', error);
      alertaLoginError('No se pudo conectar al servidor de autenticación.');
    }
  };

  const manejarLogout = () => {
    localStorage.removeItem('authToken');
    try { localStorage.removeItem('userEmail'); } catch (e) {}
    Toastify({ text: "¡Sesión cerrada! Vuelve pronto.", duration: 3000, offset:{x:20,y:100}, style:{ background: 'gray' }}).showToast();
    actualizarInterfazUsuario();
  };

  const actualizarInterfazUsuario = () => {
    const loginNavItem = document.getElementById('login-nav-item');
    const logoutNavItemLocal = document.getElementById('logout-nav-item');
    const token = localStorage.getItem('authToken');
    if (token) {
      if (loginNavItem) loginNavItem.style.display = 'none';
      if (logoutNavItemLocal) {
        const userEmail = localStorage.getItem('userEmail') || '';
        const localPart = (userEmail && userEmail.indexOf('@') > -1) ? userEmail.split('@')[0] : userEmail || 'Usuario';

        // Asegurar que el nombre de usuario sea un sibling (fuera del <a>)
        const parent = logoutNavItemLocal.parentNode;
        if (parent) {
          // Forzar layout en línea y centrado entre username + icon
          parent.classList.add('d-flex', 'align-items-center', 'gap-2');

          let usernameEl = parent.querySelector('.user-name-text-sibling');
          if (!usernameEl) {
            usernameEl = document.createElement('span');
            // No usar `nav-link` para evitar hover/colores del link; usar texto simple
            usernameEl.className = 'user-name-text-sibling text-dark me-2';
            usernameEl.setAttribute('aria-hidden', 'true');
            parent.insertBefore(usernameEl, logoutNavItemLocal);
          }
          usernameEl.textContent = localPart;
        }

        // Dejar el anchor solo con el icono de logout (así el hover solo aplica al icono)
        // Mantener la clase `nav-link` en el anchor para que solo el icono tenga el comportamiento de link
        logoutNavItemLocal.classList.add('nav-link', 'p-0');
        logoutNavItemLocal.innerHTML = `<i class="bi bi-box-arrow-right align-middle logout-trigger" role="button" title="Cerrar sesión"></i>`;
        logoutNavItemLocal.style.display = 'block';
      }
    } else {
      if (loginNavItem) loginNavItem.style.display = 'block';
      if (logoutNavItemLocal) {
        logoutNavItemLocal.style.display = 'none';
        const parent = logoutNavItemLocal.parentNode;
        if (parent) {
          const usernameEl = parent.querySelector('.user-name-text-sibling');
          if (usernameEl) usernameEl.remove();
          parent.classList.remove('d-flex', 'align-items-center', 'gap-2');
        }
        logoutNavItemLocal.classList.remove('nav-link', 'p-0');
      }
    }
  };

  window.actualizarInterfazUsuario = actualizarInterfazUsuario;

  document.addEventListener('DOMContentLoaded', () => {
    if (loginForm) loginForm.addEventListener('submit', manejarLogin);
    if (logoutNavItem) {
      // Escuchar clicks en el icono de logout; abrir confirmación
      logoutNavItem.addEventListener('click', (e) => {
        const trigger = e.target.closest && e.target.closest('.logout-trigger');
        if (!trigger) return; // solo reaccionar si se clickeó el icono

        const doConfirm = (onConfirm) => {
          // Usar modal de Bootstrap si está disponible
          if (typeof bootstrap !== 'undefined') {
            // Crear modal dinámicamente
            const modalId = 'logoutConfirmModal';
            // Eliminar si existe uno previo
            const existing = document.getElementById(modalId);
            if (existing) existing.remove();

            const modalHtml = `
              <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Confirmar cierre de sesión</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <p>¿Desea cerrar sesión?</p>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                      <button type="button" class="btn btn-danger" id="confirm-logout-btn">Sí, estoy seguro</button>
                    </div>
                  </div>
                </div>
              </div>
            `;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = modalHtml;
            document.body.appendChild(wrapper.firstElementChild);

            const modalEl = document.getElementById(modalId);
            const modalInstance = new bootstrap.Modal(modalEl, { backdrop: 'static' });
            modalEl.addEventListener('hidden.bs.modal', () => { modalEl.remove(); });

            modalEl.querySelector('#confirm-logout-btn').addEventListener('click', () => {
              modalInstance.hide();
              onConfirm();
            });

            modalInstance.show();
            return;
          }

          // Fallback simple
          if (window.confirm && window.confirm('¿Desea cerrar sesión?')) onConfirm();
        };

        doConfirm(manejarLogout);
      });
    }
    actualizarInterfazUsuario();
  });

})();
