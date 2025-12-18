// Auth module: maneja login/logout y actualización de UI
(function(){
  // Leer configuración global si está disponible
  const API_BASE = (typeof window !== 'undefined' && window.Config && window.Config.API_URL) ? window.Config.API_URL : null;
  // Si no hay API_BASE, dejamos el endpoint en null para forzar configuración explícita
  const API_LOGIN_ENDPOINT = API_BASE ? `${API_BASE}/api/auth/login` : null;
  const API_GOOGLE_ENDPOINT = API_BASE ? `${API_BASE}/api/auth/google` : null;

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
      const data = await response.json();

      if (response.ok) {
        // Si es mock y no viene token, intentar leer structure
        const token = data.token || data.accessToken || null;
        if (token) guardarToken(token);
        alertaLoginExitoso(email);
        cerrarModalUsuario(); form.reset();
        actualizarInterfazUsuario();
      } else {
        const errorMessage = data.msg || data.error || "Credenciales inválidas o no existen.";
        alertaLoginError(errorMessage);
        if (emailInput) emailInput.focus();
      }
    } catch (error) {
      // Mostrar mensaje amigable en UI, evitar crash en consola redundante
      console.warn('Login request failed (network or CORS):', error);
      alertaLoginError('No se pudo conectar al servidor de autenticación.');
    }
  };

  const manejarLogout = () => {
    localStorage.removeItem('authToken');
    Toastify({ text: "¡Sesión cerrada! Vuelve pronto.", duration: 3000, offset:{x:20,y:100}, style:{ background: 'gray' }}).showToast();
    actualizarInterfazUsuario();
  };

  const actualizarInterfazUsuario = () => {
    const loginNavItem = document.getElementById('login-nav-item');
    const logoutNavItemLocal = document.getElementById('logout-nav-item');
    const token = localStorage.getItem('authToken');
    if (token) {
      if (loginNavItem) loginNavItem.style.display = 'none';
      if (logoutNavItemLocal) logoutNavItemLocal.style.display = 'block';
    } else {
      if (loginNavItem) loginNavItem.style.display = 'block';
      if (logoutNavItemLocal) logoutNavItemLocal.style.display = 'none';
    }
  };

  window.actualizarInterfazUsuario = actualizarInterfazUsuario;

  document.addEventListener('DOMContentLoaded', () => {
    if (loginForm) loginForm.addEventListener('submit', manejarLogin);
    if (logoutNavItem) logoutNavItem.addEventListener('click', manejarLogout);
    actualizarInterfazUsuario();
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) googleLoginBtn.addEventListener('click', () => {
      Toastify({ text: "Funcionalidad de Google Login en desarrollo. Por favor, usa el formulario clásico.", duration:3000, offset:{x:20,y:100}, style:{ background: 'blue' }}).showToast();
    });
  });

})();
