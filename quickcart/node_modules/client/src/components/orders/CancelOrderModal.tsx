import Modal from '../common/Modal';
import styles from './CancelOrderModal.module.scss';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const CancelOrderModal = ({ isOpen, onClose, onConfirm, loading }: CancelOrderModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h2 className={styles.title}>Cancel Order?</h2>
        <p className={styles.message}>
          Are you sure you want to cancel this order? <br />
          This action cannot be undone.
        </p>
        
        <div className={styles.actions}>
          <button 
            className={styles.keepButton} 
            onClick={onClose}
            disabled={loading}
          >
            No, Keep Order
          </button>
          <button 
            className={styles.cancelButton} 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Cancelling...' : 'Yes, Cancel Order'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelOrderModal;