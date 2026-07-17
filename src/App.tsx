import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AppContent } from './components/layout/AppContent';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
