import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { AxiosError } from 'axios';
import { DataGrid, type ColumnDef } from '../../components/common/DataGrid';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import styles from './MyOrders.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRepeat, faBan } from '@fortawesome/free-solid-svg-icons';
import CancelOrderModal from '../../components/orders/CancelOrderModal'; // 1. Import Modal

// Interfaces
interface OrderItem {
  product: { id: string; name: string; price: number; imageUrl?: string; };
}
interface Order {
  id: string; totalPrice: number; status: string; createdAt: string; items: OrderItem[];
}
interface OrderRow {
  id: string; date: string; total: string; status: string; originalOrder: Order;
}

const MyOrders = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 2. State for Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const { user } = useAuth();
  const { addItems } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get<Order[]>('/orders/myorders');
      
      const formattedData = data.map(order => ({
        id: order.id,
        date: new Date(order.createdAt).toLocaleDateString(),
        total: `₹${order.totalPrice.toFixed(2)}`,
        status: order.status,
        originalOrder: order,
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

  useEffect(() => {
    if (user) fetchOrders();
    else setLoading(false);
  }, [user]);

  const handleReorder = (order: Order) => {
    const productsToAdd = order.items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      imageUrl: item.product.imageUrl
    }));
    addItems(productsToAdd);
    showToast('Items added to cart!', 'success');
    navigate('/cart');
  };

  // 3. Open Modal Handler
  const initiateCancel = (orderId: string) => {
    setOrderToCancel(orderId);
    setIsCancelModalOpen(true);
  };

  // 4. Confirm Cancel Logic (called by Modal)
  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    setCancelLoading(true);
    try {
      await apiClient.put(`/orders/${orderToCancel}/cancel`);
      showToast('Order cancelled successfully', 'success');
      setIsCancelModalOpen(false); // Close modal
      fetchOrders(); // Refresh list
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel order', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  const columns: ColumnDef<OrderRow>[] = [
    { header: 'Order ID', accessorKey: 'id' },
    { header: 'Date', accessorKey: 'date' },
    { header: 'Total', accessorKey: 'total' },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: (row) => {
        let color = '#d97706'; // Pending (Orange)
        if (row.status === 'DELIVERED') color = '#16a34a'; // Green
        if (row.status === 'CANCELLED') color = '#dc2626'; // Red
        return <span style={{ fontWeight: 'bold', color }}>{row.status}</span>;
      }
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className={styles.actionsCell}>
          {/* Cancel Button */}
          {(row.status === 'PENDING' || row.status === 'CONFIRMED') && (
            <button 
              className={styles.cancelButton}
              onClick={() => initiateCancel(row.id)} // Open Modal instead of window.confirm
              title="Cancel Order"
            >
              <FontAwesomeIcon icon={faBan} style={{ marginRight: '5px' }} />
              Cancel
            </button>
          )}

          {/* Reorder Button */}
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

      {/* 5. Render the Modal */}
      <CancelOrderModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        loading={cancelLoading}
      />
    </div>
  );
};

export default MyOrders;