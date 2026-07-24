/**
 * Server-side types matching the API contract in docs/architecture/api-contract.md.
 * These MUST mirror the frontend types in react/src/types/.
 */

export interface Product {
  id: number;
  nombre: string;
  tipo?: string;
  img: string;
  descripcion?: string;
  precio: number;
  stock?: number;
  cantidad?: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  apellido?: string;
  address?: string;
  codigoPostal?: string;
  sexo?: string;
  telefono?: string;
  createdAt?: string;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress?: string;
}

export interface OrderItem {
  productId: number;
  nombre: string;
  precio: number;
  cantidad: number;
}
