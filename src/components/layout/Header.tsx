import { useState, useContext, useEffect } from 'react';
import { CartContext } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import { navigate } from '../../services/router';
import { CartModal } from '../cart/CartModal';
import { LoginModal } from '../auth/LoginModal';
import { LogoutConfirmModal } from '../auth/LogoutConfirmModal';

export function Header({ onNavigate }: { onNavigate: (view: 'home' | 'shop') => void }) {
  const { itemCount } = useContext(CartContext)!;
  const { isAuthenticated, user, logout } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cerrar menú con tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <nav className="sticky top-0 left-0 z-40 bg-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16">
            <h1
              className="text-2xl font-bold tracking-tight text-gray-900 font-display flex items-center gap-2 cursor-pointer shrink-0"
              id="title"
              onClick={() => onNavigate('home')}
            >
              <img src="/img/favicon.ico" alt="Rock Merch & Roll" className="h-8 w-8" />
              Rock Merch & Roll
            </h1>

            {/* Desktop: menú inline en el mismo row que el logo */}
            {/* Mobile: dropdown absoluto debajo del header */}
            <div
              id="mobile-menu"
              className={`
                flex-col
                lg:flex lg:flex-row lg:items-center lg:gap-4 lg:static lg:bg-transparent lg:shadow-none lg:border-0 lg:p-0
                absolute left-0 right-0 top-full bg-white shadow-md border-t border-gray-200 p-4 z-50
                transition-all duration-300 ease-in-out
                ${mobileMenuOpen ? 'flex' : 'hidden'}
              `}
            >
              <ul className="flex-col lg:flex-row flex lg:items-center gap-4 list-none m-0 p-0">
                <li className="nav-item">
                  <button
                    className="nav-link px-2 py-1 text-black no-underline transition-colors duration-300 hover:text-coral text-base bg-transparent border-0 cursor-pointer w-full text-left lg:w-auto"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('home');
                    }}
                  >
                    Inicio
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link px-2 py-1 text-black no-underline transition-colors duration-300 hover:text-coral text-base bg-transparent border-0 cursor-pointer w-full text-left lg:w-auto"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('shop');
                    }}
                  >
                    Productos
                  </button>
                </li>
                {isAuthenticated && user?.role === 'admin' && (
                  <li className="nav-item">
                    <a
                      href="/admin"
                      className="nav-link px-2 py-1 text-purple-700 no-underline transition-colors duration-300 hover:text-purple-500 text-base bg-transparent border-0 cursor-pointer font-semibold block lg:inline"
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        window.history.pushState({}, '', '/admin');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                    >
                      Admin
                    </a>
                  </li>
                )}
              </ul>

              <div className="flex-col lg:flex-row flex lg:items-center gap-4 lg:ml-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-200">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-2">
                    <span className="text-dark whitespace-nowrap">
                      {user.name}
                    </span>
                    <button
                      className="nav-link p-0 bg-transparent border-0 cursor-pointer"
                      onClick={() => setLogoutConfirmOpen(true)}
                      title="Cerrar sesión"
                    >
                      <i className="bi bi-box-arrow-right align-middle logout-trigger navbar-icon text-xl" />
                    </button>
                  </div>
                ) : (
                  <button
                    id="login-nav-item"
                    className="nav-link bg-transparent border-0 p-0 cursor-pointer"
                    onClick={() => setLoginOpen(true)}
                  >
                    <i className="bx bx-user navbar-icon" />
                  </button>
                )}

                <button
                  id="tienda"
                  className="relative bg-transparent border-0 cursor-pointer p-0"
                  onClick={() => setCartOpen(true)}
                  aria-label="Abrir carrito"
                >
                  <i className="bx bxs-shopping-bag navbar-icon text-xl" />
                  <span
                    id="contador-carrito"
                    className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {itemCount}
                  </span>
                </button>
              </div>
            </div>

            <button
              className="lg:hidden p-2 border-none outline-none cursor-pointer"
              type="button"
              id="bar"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <i className="bx bx-menu" />
            </button>
          </div>
        </div>
      </nav>

      {/* Backdrop solo en mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <LogoutConfirmModal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={() => { logout(); setLogoutConfirmOpen(false); }}
      />

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
