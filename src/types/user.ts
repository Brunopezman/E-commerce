/** Usuario del sistema */
export interface User {
  id: number | string;
  email: string;
  name: string;
  apellido?: string;
  address?: string;
  codigoPostal?: string;
  sexo?: string;
  telefono?: string;
  createdAt?: string;
}
