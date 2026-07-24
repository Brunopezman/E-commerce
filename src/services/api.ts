/**
 * API Service — Single source of truth for all backend calls.
 *
 * This module defines the base URL and endpoints for the e-commerce API.
 * Each function returns typed responses matching the API contract.
 */

import type { Product } from '../types/product';
import type { Order } from '../types/order';

/**
 * Base URL for all API calls.
 * - In dev: falls back to http://localhost:4000
 * - In prod: set VITE_API_URL en Vercel dashboard → https://rockmerch-api.onrender.com
 */
export const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:4000';

// ──────────────────────────────────────────────
//  Products
// ──────────────────────────────────────────────

/** GET /products — full catalog */
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products`);
  if (!res.ok) throw new Error(`fetchProducts failed: HTTP ${res.status}`);
  return res.json();
}

/** GET /products/:id — single product */
export async function fetchProductById(id: number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error(`fetchProductById failed: HTTP ${res.status}`);
  return res.json();
}

/** PATCH /products/:id/stock — update product stock (requires auth) */
export async function updateProductStock(
  id: number,
  stock: number,
): Promise<Product> {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${BASE_URL}/products/${id}/stock`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ stock }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data.error as string) || `Error al actualizar stock: HTTP ${res.status}`,
    );
  }

  return res.json();
}

// ──────────────────────────────────────────────
//  Orders
// ──────────────────────────────────────────────

/** POST /orders — create a new order */
export async function createOrder(
  order: Omit<Order, 'id' | 'createdAt' | 'status'>,
): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(`createOrder failed: HTTP ${res.status}`);
  return res.json();
}
