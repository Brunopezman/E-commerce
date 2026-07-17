import type { AuthUser, AuthState } from '../types/auth';

const AUTH_TOKEN_KEY = 'authToken';
const USER_EMAIL_KEY = 'userEmail';
const USER_ID_KEY = 'userId';
const USER_NAME_KEY = 'userName';
const USER_APELLIDO_KEY = 'userApellido';
const USER_ADDRESS_KEY = 'userAddress';
const USER_CODIGO_POSTAL_KEY = 'userCodigoPostal';
const USER_SEXO_KEY = 'userSexo';
const USER_TELEFONO_KEY = 'userTelefono';

/**
 * Optional configuration that can be injected via window.__RMR_CONFIG__
 * to toggle mock authentication mode.
 */
interface RmrConfig {
  USE_MOCK_AUTH?: boolean;
}

/**
 * Retrieve the app configuration from the global scope in a type-safe way.
 */
function getConfig(): RmrConfig {
  if (typeof window === 'undefined') return {};
  const cfg = (window as { __RMR_CONFIG__?: RmrConfig }).__RMR_CONFIG__;
  return cfg ?? {};
}

/**
 * Check if mock auth is enabled via window.__RMR_CONFIG__.
 */
function isMockAuth(): boolean {
  try {
    return getConfig().USE_MOCK_AUTH === true;
  } catch {
    return false;
  }
}

/**
 * Attempt login with email/password.
 * In mock mode, accepts any credentials and stores a demo token.
 * In real mode, makes a POST request to the configured API endpoint.
 */
export async function login(
  email: string,
  password: string,
  apiBase?: string,
): Promise<{ user: AuthUser; token: string }> {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    throw new Error('Email y contraseña son obligatorios.');
  }

  if (isMockAuth() || !apiBase) {
    // Demo mode: accept any credentials
    const token = 'demo-token';
    const user: AuthUser = {
      id: Date.now(),
      email: trimmedEmail,
      name: trimmedEmail.split('@')[0] || trimmedEmail,
    };
    return { user, token };
  }

  // Real API login
  const endpoint = `${apiBase}/api/auth/login`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
  });

  let data: Record<string, unknown> = {};
  try {
    data = await response.json();
  } catch {
    data = { msg: 'Respuesta inesperada del servidor.' };
  }

  if (!response.ok) {
    const errorMsg =
      (data.msg as string) || (data.error as string) || 'Credenciales inválidas.';
    throw new Error(errorMsg);
  }

  const token = (data.token as string) || (data.accessToken as string) || '';
  // Use the full user object from the API response when available
  const user: AuthUser =
    (data.user as AuthUser) ?? {
      id: Date.now(),
      email: trimmedEmail,
      name: trimmedEmail.split('@')[0] || trimmedEmail,
    };

  return { user, token };
}

/**
 * Register a new user account.
 * In mock mode, accepts any data and returns a demo token.
 * In real mode, POSTs to /api/auth/register.
 */
export async function register(
  email: string,
  password: string,
  profileData: {
    name: string;
    apellido?: string;
    address?: string;
    codigoPostal?: string;
    sexo?: string;
    telefono?: string;
  },
  apiBase?: string,
): Promise<{ user: AuthUser; token: string }> {
  const trimmedEmail = email.trim();

  if (!trimmedEmail || !password || !profileData.name) {
    throw new Error('Email, contraseña y nombre son obligatorios.');
  }

  if (isMockAuth() || !apiBase) {
    // Demo mode: accept any data
    const token = 'demo-token';
    const user: AuthUser = {
      id: Date.now(),
      email: trimmedEmail,
      name: profileData.name,
      apellido: profileData.apellido,
      address: profileData.address,
      codigoPostal: profileData.codigoPostal,
      sexo: profileData.sexo,
      telefono: profileData.telefono,
    };
    return { user, token };
  }

  // Real API register
  const endpoint = `${apiBase}/api/auth/register`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: trimmedEmail,
      password,
      name: profileData.name,
      apellido: profileData.apellido,
      address: profileData.address,
      codigoPostal: profileData.codigoPostal,
      sexo: profileData.sexo,
      telefono: profileData.telefono,
    }),
  });

  let data: Record<string, unknown> = {};
  try {
    data = await response.json();
  } catch {
    data = { msg: 'Respuesta inesperada del servidor.' };
  }

  if (!response.ok) {
    const errorMsg =
      (data.error as string) || (data.msg as string) || 'Error al registrar.';
    throw new Error(errorMsg);
  }

  const token = (data.token as string) || '';
  const user = data.user as AuthUser;

  return { user, token };
}

/**
 * Load saved auth state from localStorage.
 */
export function loadAuthState(): AuthState {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const email = localStorage.getItem(USER_EMAIL_KEY);

    if (token && email) {
      const id = localStorage.getItem(USER_ID_KEY);
      const name =
        localStorage.getItem(USER_NAME_KEY) ||
        email.split('@')[0] ||
        email;
      const apellido = localStorage.getItem(USER_APELLIDO_KEY) || undefined;
      const address = localStorage.getItem(USER_ADDRESS_KEY) || undefined;
      const codigoPostal = localStorage.getItem(USER_CODIGO_POSTAL_KEY) || undefined;
      const sexo = localStorage.getItem(USER_SEXO_KEY) || undefined;
      const telefono = localStorage.getItem(USER_TELEFONO_KEY) || undefined;

      const user: AuthUser = {
        ...(id ? { id: isNaN(Number(id)) ? id : Number(id) } : { id: Date.now() }),
        email,
        name,
        ...(apellido ? { apellido } : {}),
        ...(address ? { address } : {}),
        ...(codigoPostal ? { codigoPostal } : {}),
        ...(sexo ? { sexo } : {}),
        ...(telefono ? { telefono } : {}),
      };

      return { user, token, isAuthenticated: true };
    }
  } catch {
    // localStorage unavailable
  }

  return { user: null, token: null, isAuthenticated: false };
}

/**
 * Save auth state to localStorage.
 */
export function saveAuthState(user: AuthUser, token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_EMAIL_KEY, user.email);
    if (user.id != null) {
      localStorage.setItem(USER_ID_KEY, String(user.id));
    }
    if (user.name) {
      localStorage.setItem(USER_NAME_KEY, user.name);
    }
    if (user.apellido) {
      localStorage.setItem(USER_APELLIDO_KEY, user.apellido);
    }
    if (user.address) {
      localStorage.setItem(USER_ADDRESS_KEY, user.address);
    }
    if (user.codigoPostal) {
      localStorage.setItem(USER_CODIGO_POSTAL_KEY, user.codigoPostal);
    }
    if (user.sexo) {
      localStorage.setItem(USER_SEXO_KEY, user.sexo);
    }
    if (user.telefono) {
      localStorage.setItem(USER_TELEFONO_KEY, user.telefono);
    }
  } catch {
    // localStorage unavailable
  }
}

/**
 * Clear auth state from localStorage.
 */
export function clearAuthState(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(USER_APELLIDO_KEY);
    localStorage.removeItem(USER_ADDRESS_KEY);
    localStorage.removeItem(USER_CODIGO_POSTAL_KEY);
    localStorage.removeItem(USER_SEXO_KEY);
    localStorage.removeItem(USER_TELEFONO_KEY);
  } catch {
    // noop
  }
}
