// Auth module: maneja login/logout y actualización de UI
(function(){
  const API_LOGIN_ENDPOINT = 'https://mis-credenciales.free.beeceptor.com/login';
  const API_GOOGLE_ENDPOINT = 'http://tu-servidor-backend.com/api/auth/google';

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
      const response = await fetch(API_LOGIN_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        guardarToken(data.token);
        alertaLoginExitoso(email);
        cerrarModalUsuario(); form.reset();
        actualizarInterfazUsuario();
      } else {
        const errorMessage = data.msg || data.error || "Credenciales inválidas o no existen.";
        alertaLoginError(errorMessage);
        if (emailInput) emailInput.focus();
      }
    } catch (error) {
      console.error('Error al intentar iniciar sesión:', error);
      alertaLoginError('No se pudo conectar al servidor.');
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
