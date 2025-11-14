import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './DriverDashboard.module.scss'; // <-- Import SCSS

interface Order {
  id: string;
  totalPrice: number;
  status: string;
  user: { name: string };
  _count?: { items: number };
}

interface Delivery {
  id: string;
  status: string;
  order: Order;
}

const DriverDashboard = () => {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<Delivery[]>([]);
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [availableRes, myRes] = await Promise.all([
        apiClient.get('/delivery/available'),
        apiClient.get('/delivery/my-deliveries')
      ]);
      setAvailableOrders(availableRes.data);
      setMyDeliveries(myRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (orderId: string) => {
    try {
      await apiClient.post(`/delivery/${orderId}/accept`);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to accept order');
    }
  };

  const handleComplete = async (deliveryId: string) => {
    try {
      await apiClient.put(`/delivery/${deliveryId}/complete`);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to complete delivery');
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1>🚗 Driver Portal</h1>
        <button 
          className={styles.logoutButton} 
          onClick={() => { logout(); navigate('/auth/login'); }}
        >
          Logout
        </button>
      </div>

      {/* My Active Deliveries Section */}
      <div className={styles.section}>
        <h2>My Active Deliveries</h2>
        {myDeliveries.length === 0 ? (
          <p className={styles.emptyMessage}>No active deliveries. Pick one up below!</p>
        ) : (
          <div className={styles.cardGrid}>
            {myDeliveries.map(del => (
              <div key={del.id} className={styles.activeCard}>
                <div className={styles.cardHeader}>
                  <h3>Order #{del.order.id.slice(-6)}</h3>
                  <span className={styles.statusBadge}>{del.status}</span>
                </div>
                <p><strong>Customer:</strong> {del.order.user.name}</p>
                <button 
                  className={styles.completeButton}
                  onClick={() => handleComplete(del.id)}
                >
                  Mark Delivered ✅
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Orders Section */}
      <div className={styles.section}>
        <h2>Available for Pickup</h2>
        {availableOrders.length === 0 ? (
          <p className={styles.emptyMessage}>No orders currently waiting for pickup.</p>
        ) : (
          <div className={styles.cardGrid}>
            {availableOrders.map(order => (
              <div key={order.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Order #{order.id.slice(-6)}</h3>
                  <span className={styles.statusBadge}>{order.status}</span>
                </div>
                <p><strong>Customer:</strong> {order.user.name}</p>
                <p>Items: {order._count?.items || 0}</p>
                <button 
                  className={styles.acceptButton}
                  onClick={() => handleAccept(order.id)}
                >
                  Accept Order
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;