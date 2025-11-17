import styles from './ProductCard.module.scss';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'; // Added faMinus, faPlus

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // 1. Get all cart functions we need
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const { showToast } = useToast();

  // 2. Check if product is already in cart
  const cartItem = cartItems.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  // --- Handlers ---

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeFromCart(product.id);
      showToast(`${product.name} removed from cart`, 'error');
    }
  };

  // --- Image Fix Logic ---
  const getImageUrl = (url?: string | null) => {
    const placeholderImg = 'https://via.placeholder.com/300x300.png?text=No+Image';

    if (!url) return placeholderImg;
    
    if (url.startsWith('http') || url.startsWith('https')) {
      return url;
    }

    return `http://localhost:5000${url}`;
  };

  const imageSrc = getImageUrl(product.imageUrl);

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={imageSrc} alt={product.name} />
      </div>
      <h3 className={styles.name}>{product.name}</h3>
      <p className={styles.price}>₹{product.price.toFixed(2)}</p>
      
      {/* 3. Conditional Rendering: Show Quantity Controls or Add Button */}
      {quantity > 0 ? (
        <div className={styles.quantityControl}>
          <button onClick={handleDecrement} className={styles.qtyBtn}>
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <span className={styles.qtyValue}>{quantity}</span>
          <button onClick={handleIncrement} className={styles.qtyBtn}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      ) : (
        <button
          className={styles.addButton}
          onClick={handleAddToCart}
        >
          <FontAwesomeIcon icon={faCartPlus} style={{ marginRight: '8px' }} />
          Add to Cart
        </button>
      )}
    </div>
  );
};

export default ProductCard;