// client/src/App.tsx
import { AppRouter } from './router/router';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext'; // <-- 1. IMPORT
import './assets/scss/main.scss';
import { ToastProvider } from './contexts/ToastContext'; // <-- Import

function App() {
  return (
    <AuthProvider>
      <ToastProvider> {/* <-- Wrap CartProvider */}
        <CartProvider>
          <AppRouter />
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;