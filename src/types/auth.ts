export interface AuthUser {
  id: number | string;
  email: string;
  name: string;
  apellido?: string;
  address?: string;
  codigoPostal?: string;
  sexo?: string;
  telefono?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}
