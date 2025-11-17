import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import { AxiosError } from 'axios';
import { useToast } from '../../contexts/ToastContext';
import AddressSelector from '../../components/checkout/AddressSelector';
import styles from './CheckoutPage.module.scss';

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleConfirmOrder = async () => {
    if (!user) {
      navigate('/auth/login?redirect=/checkout');
      return;
    }
    if (!selectedAddressId) {
      showToast('Please select a delivery address', 'error');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const { data: newOrder } = await apiClient.post('/orders', {
        cartItems: cartItems,
        totalPrice: total,
        addressId: selectedAddressId,
      });
      
      setLoading(false);
      clearCart();
      navigate(`/order-success/${newOrder.id}`);

    } catch (err) {
      console.error(err);
      let message = 'Checkout failed';
      if (err instanceof AxiosError) message = err.response?.data?.message || message;
      setError(message);
      showToast(message, 'error');
      setLoading(false);
    }
  };

  return (
    <div className={styles.grid}>
      {/* Left Column: Address */}
      <div className={styles.leftColumn}>
        <AddressSelector 
          selectedAddressId={selectedAddressId}
          onSelect={setSelectedAddressId}
        />
      </div>

      {/* Right Column: Summary */}
      <div className={styles.summary}>
        <h2 className={styles.total}>Order Summary</h2>
        <div className={styles.itemList}>
          {cartItems.map(item => (
            <div key={item.id} className={styles.summaryItem}>
              <span>{item.quantity} x {item.name}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <hr />
        <div className={styles.summaryItem}>
          <strong>Total</strong>
          <strong>₹{total.toFixed(2)}</strong>
        </div>

        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

        <button 
          className={styles.confirmButton}
          onClick={handleConfirmOrder}
          disabled={loading || cartItems.length === 0}
        >
          {loading ? 'Placing Order...' : 'Confirm & Pay'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;