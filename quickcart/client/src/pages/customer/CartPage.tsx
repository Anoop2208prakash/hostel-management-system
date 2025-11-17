import { useCart } from '../../contexts/CartContext';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import styles from './CartPage.module.scss';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // --- Image Helper ---
  const getImageUrl = (url?: string | null) => {
    const placeholderImg = 'https://via.placeholder.com/300x300.png?text=No+Image';

    if (!url) return placeholderImg;
    
    if (url.startsWith('http') || url.startsWith('https')) {
      return url;
    }

    return `http://localhost:5000${url}`;
  };

  if (cartItems.length === 0) {
    return (
      <EmptyState 
        title="Your cart is empty" 
        message="Looks like you haven't added any groceries yet."
      >
        <Link 
          to="/" 
          style={{textDecoration: 'none', background: '#31694E', color: 'white', padding: '10px 15px', borderRadius: 4}}
        >
          Start Shopping
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className={styles.cartPage}>
      <h1>Your Cart</h1>
      <div>
        {cartItems.map(item => (
          <div key={item.id} className={styles.item}>
            <img 
              src={getImageUrl(item.imageUrl)}
              alt={item.name} 
              className={styles.itemImage}
            />
            <div className={styles.itemDetails}>
              <h4>{item.name}</h4>
              <p>₹{item.price.toFixed(2)}</p>
            </div>
            <div className={styles.quantityControl}>
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            </div>
            <button 
              className={styles.removeButton} 
              onClick={() => removeFromCart(item.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      
      <div className={styles.summary}>
        <h2 className={styles.total}>
          Subtotal: ₹{total.toFixed(2)}
        </h2>

        {/* --- THIS IS THE UPDATE --- */}
        {/* Changed button to a Link that goes to the new Checkout Page */}
        <Link to="/checkout" className={styles.checkoutButton}>
          Proceed to Checkout
        </Link>
        {/* --- END UPDATE --- */}
      </div>
    </div>
  );
};

export default CartPage;