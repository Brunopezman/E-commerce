import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// ─── Mock global fetch para evitar llamadas reales ────────────────────
// El App y sus children (useCatalog, ShoppingConcierge) hacen fetch a
// http://localhost:4000/products y fallback a /data/db.json.
// Retornamos un array vacío para aislar el test de la red.

let mockFetchUrlCallback;

beforeEach(() => {
  // Mock de fetch que responde a cualquier URL con productos vacíos
  mockFetchUrlCallback = vi.fn((url) => {
    if (url === '/data/db.json') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ products: [] }),
      });
    }
    // API: devolvemos OK con array vacío
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  global.fetch = vi.fn().mockImplementation(mockFetchUrlCallback);

  // Limpiar localStorage para cada test
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ──────────────────────────────────────────────────────────────────────
//  Navegación — App entera
// ──────────────────────────────────────────────────────────────────────
describe('App — renderizado inicial (home)', () => {
  it('renderiza el título principal de la app', async () => {
    render(<App />);

    // El título aparece tanto en la navbar como en el hero
    const titles = await screen.findAllByText('Rock Merch & Roll');
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  it('muestra la sección hero con el botón "Compra Ahora" en home', async () => {
    render(<App />);

    // El hero tiene un botón "Compra Ahora"
    const compraAhora = await screen.findByText('Compra Ahora');
    expect(compraAhora).toBeInTheDocument();
    expect(compraAhora.tagName).toBe('BUTTON');
  });

  it('muestra el subtítulo del hero en home', async () => {
    render(<App />);

    const subtitle = await screen.findByText('Contenido para fanáticos');
    expect(subtitle).toBeInTheDocument();
  });

  it('muestra la sección de servicios (banner-services) en home', async () => {
    render(<App />);

    const envios = await screen.findByText('Envíos gratis');
    expect(envios).toBeInTheDocument();

    const cuotas = await screen.findByText('Financiación en cuotas');
    expect(cuotas).toBeInTheDocument();

    const segura = await screen.findByText('Compra de manera segura');
    expect(segura).toBeInTheDocument();
  });

  it('muestra la sección brand con logos de bandas en home', async () => {
    render(<App />);

    // Logos de bandas
    expect(screen.getByAltText('AC/DC')).toBeInTheDocument();
    expect(screen.getByAltText('The Beatles')).toBeInTheDocument();
    expect(screen.getByAltText('Guns N\' Roses')).toBeInTheDocument();
  });

  it('muestra el navbar con botones de navegación', async () => {
    render(<App />);

    // Los botones de navegación son los únicos <button> con estos textos
    const inicioBtn = await screen.findByText('Inicio', { selector: 'button' });
    const productosBtn = await screen.findByText('Productos', { selector: 'button' });
    const contactoBtn = await screen.findByText('Contacto', { selector: 'button' });

    expect(inicioBtn).toBeInTheDocument();
    expect(productosBtn).toBeInTheDocument();
    expect(contactoBtn).toBeInTheDocument();
  });

  it('NO muestra la sección de productos en home', () => {
    render(<App />);

    // El título "Productos" de la sección shop no debería estar visible
    // (solo el link de navegación "Productos")
    expect(screen.queryByText('Aca vas a poder observar los produtos con los mejores precios de la temporada.')).not.toBeInTheDocument();
  });

  it('muestra el footer con enlaces', async () => {
    render(<App />);

    const footerProductos = await screen.findByText('Productos', { selector: 'h5' });
    expect(footerProductos).toBeInTheDocument();
    expect(screen.getByText('Remeras')).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────────
//  Navegación: home → shop → home
// ──────────────────────────────────────────────────────────────────────
describe('Navegación — home/shop', () => {
  it('navega a shop al hacer clic en "Productos" del navbar', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click en "Productos" del navbar
    const productosBtn = await screen.findByText('Productos', { selector: 'button' });
    await user.click(productosBtn);

    // Ahora debería verse la sección de productos
    await waitFor(() => {
      expect(screen.getByText('Aca vas a poder observar los produtos con los mejores precios de la temporada.')).toBeInTheDocument();
    });

    // Hero debería estar oculto
    expect(screen.queryByText('Contenido para fanáticos')).not.toBeInTheDocument();
  });

  it('navega a shop y vuelve a home al hacer clic en "Inicio"', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Ir a shop
    const productosBtn = await screen.findByText('Productos', { selector: 'button' });
    await user.click(productosBtn);

    await waitFor(() => {
      expect(screen.getByText('Aca vas a poder observar los produtos con los mejores precios de la temporada.')).toBeInTheDocument();
    });

    // Volver a home
    const inicioBtn = await screen.findByText('Inicio', { selector: 'button' });
    await user.click(inicioBtn);

    await waitFor(() => {
      expect(screen.getByText('Contenido para fanáticos')).toBeInTheDocument();
    });

    // Shop debería estar oculto
    expect(screen.queryByText('Aca vas a poder observar los produtos con los mejores precios de la temporada.')).not.toBeInTheDocument();
  });

  it('el botón "Compra Ahora" en hero navega a shop', async () => {
    const user = userEvent.setup();
    render(<App />);

    const compraAhora = await screen.findByText('Compra Ahora');
    await user.click(compraAhora);

    await waitFor(() => {
      expect(screen.getByText('Aca vas a poder observar los produtos con los mejores precios de la temporada.')).toBeInTheDocument();
    });
  });
});

// ──────────────────────────────────────────────────────────────────────
//  Navegación: checkout vía URL
// ──────────────────────────────────────────────────────────────────────
describe('Ruteo — checkout por pathname', () => {
  it('renderiza la página de checkout cuando la ruta es /checkout', async () => {
    // Simular navegación a /checkout antes de renderizar
    act(() => {
      window.history.pushState({}, '', '/checkout');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    render(<App />);

    // El checkout renderiza. Con carrito vacío muestra la pantalla de
    // "Tu carrito está vacío" y un enlace para volver a la tienda
    await waitFor(() => {
      expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
    });
    expect(screen.getByText('Ir a la tienda')).toBeInTheDocument();
  });

  it('renderiza shop normal cuando la ruta no incluye checkout', () => {
    act(() => {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    render(<App />);

    // Debería ver la home
    expect(screen.getByText('Contenido para fanáticos')).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────────
//  Carrito — contador y modal
// ──────────────────────────────────────────────────────────────────────
describe('Carrito — interacción mínima desde App', () => {
  it('el contador del carrito muestra 0 inicialmente', async () => {
    render(<App />);

    const contador = await screen.findByText('0');
    // El contador está dentro del span con id "contador-carrito"
    expect(contador.id).toBe('contador-carrito');
  });

  it('abre el modal del carrito al hacer clic en el icono del carrito', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Buscar el botón del carrito por aria-label
    const cartButton = await screen.findByLabelText('Abrir carrito');
    await user.click(cartButton);

    // El modal del carrito debería abrirse — verificamos que "Carrito" (título del modal) está visible
    await waitFor(() => {
      expect(screen.getByText('Carrito')).toBeInTheDocument();
    });
    // También debería mostrar que está vacío y el botón de finalizar
    expect(screen.getByText('El carrito está vacío')).toBeInTheDocument();
  });
});
