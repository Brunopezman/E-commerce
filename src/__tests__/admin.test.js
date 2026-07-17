import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadAuthState, saveAuthState, clearAuthState } from '../services/authService';
import { fetchAllUsers } from '../services/userService';

// ─── Mock localStorage ─────────────────────────────────────────────────

const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _getStore: () => store,
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
});

// ─── Mock fetch ────────────────────────────────────────────────────────

const mockJsonResponse = (data, status = 200) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });

describe('authService — role persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('saveAuthState persiste el role del usuario', () => {
    saveAuthState(
      { id: 1, email: 'admin@test.com', name: 'Admin', role: 'admin' },
      'token-123',
    );

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('userRole', 'admin');
  });

  it('loadAuthState recupera el role guardado', () => {
    mockLocalStorage.setItem('authToken', 'token-123');
    mockLocalStorage.setItem('userEmail', 'admin@test.com');
    mockLocalStorage.setItem('userName', 'Admin');
    mockLocalStorage.setItem('userRole', 'admin');

    const state = loadAuthState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.role).toBe('admin');
  });

  it('loadAuthState no incluye role si no está guardado', () => {
    mockLocalStorage.setItem('authToken', 'token-123');
    mockLocalStorage.setItem('userEmail', 'user@test.com');
    mockLocalStorage.setItem('userName', 'User');

    const state = loadAuthState();
    expect(state.user?.role).toBeUndefined();
  });

  it('clearAuthState elimina el role', () => {
    mockLocalStorage.setItem('userRole', 'admin');
    clearAuthState();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userRole');
  });
});

describe('userService — fetchAllUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  it('llama a GET /users con token de auth', async () => {
    const fakeUsers = [
      { id: 1, email: 'admin@test.com', name: 'Admin', role: 'admin' },
      { id: 2, email: 'user@test.com', name: 'User', role: 'user' },
    ];

    globalThis.fetch.mockResolvedValue(mockJsonResponse(fakeUsers));

    const result = await fetchAllUsers('admin-token');

    expect(result).toHaveLength(2);
    expect(result[0].role).toBe('admin');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer admin-token',
        }),
      }),
    );
  });

  it('lanza error si la respuesta no es ok', async () => {
    globalThis.fetch.mockResolvedValue(
      mockJsonResponse({ error: 'Acceso denegado' }, 403),
    );

    await expect(fetchAllUsers('user-token')).rejects.toThrow(
      'Acceso denegado',
    );
  });
});
