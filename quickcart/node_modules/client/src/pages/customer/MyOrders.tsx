import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { AxiosError } from 'axios';
import { DataGrid, type ColumnDef } from '../../components/common/DataGrid';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext'; // 1. Import Cart
import { useToast } from '../../contexts/ToastContext'; // 2. Import Toast
import { useNavigate } from 'react-router-dom';
import styles from './MyOrders.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRepeat } from '@fortawesome/free-solid-svg-icons';

// Define the structure of the order items from the API
interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
}

interface Order {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[]; // Need items to reorder
}

interface OrderRow {
  id: string;
  date: string;
  total: string;
  status: string;
  originalOrder: Order; // Keep reference to full object
}

const MyOrders = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const { addItems } = useCart(); // 3. Get addItems function
  const { showToast } = useToast();
  const navigate = useNavigate();

  // 4. Reorder Handler Logic
  const handleReorder = (order: Order) => {
    // Map order items back to the Product format needed by the cart
    const productsToAdd = order.items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      imageUrl: item.product.imageUrl
    }));

    addItems(productsToAdd); // Bulk add to cart
    showToast('Items added to cart!', 'success');
    navigate('/cart'); // Go to cart to checkout
  };

  const columns: ColumnDef<OrderRow>[] = [
    { header: 'Order ID', accessorKey: 'id' },
    { header: 'Date', accessorKey: 'date' },
    { header: 'Total', accessorKey: 'total' },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: (row) => (
        <span style={{ 
          fontWeight: 'bold', 
          color: row.status === 'DELIVERED' ? '#16a34a' : '#d97706' 
        }}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className={styles.actionsCell}>
          {/* 5. Reorder Button */}
          <button 
            className={styles.reorderButton}
            onClick={() => handleReorder(row.originalOrder)}
            title="Buy these items again"
          >
            <FontAwesomeIcon icon={faRepeat} /> Reorder
          </button>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get<Order[]>('/orders/myorders');
        
        const formattedData = data.map(order => ({
          id: order.id,
          date: new Date(order.createdAt).toLocaleDateString(),
          total: `₹${order.totalPrice.toFixed(2)}`,
          status: order.status,
          originalOrder: order, // Store full object for reordering
        }));
        
        setOrders(formattedData);
        setError('');
      } catch (err) {
        console.error(err);
        let message = 'Failed to fetch orders';
        if (err instanceof AxiosError && err.response?.data?.message) {
          message = err.response.data.message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) return <div>Loading your orders...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h2>My Orders</h2>
      <div className={styles.gridWrapper}>
        <DataGrid
          columns={columns}
          data={orders}
          emptyTitle="No Orders Found"
          emptyMessage="You haven't placed any orders yet."
        />
      </div>
    </div>
  );
};

export default MyOrders;