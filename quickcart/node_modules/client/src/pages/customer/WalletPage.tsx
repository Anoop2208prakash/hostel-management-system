import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import styles from './WalletPage.module.scss';

interface Transaction {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  createdAt: string;
}

const WalletPage = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchWallet = async () => {
    try {
      const { data } = await apiClient.get('/wallet');
      setBalance(data.walletBalance);
      setTransactions(data.transactions);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      await apiClient.post('/wallet/add', { amount });
      showToast(`Successfully added ₹${amount}`, 'success');
      setAmount('');
      fetchWallet(); // Refresh balance
    } catch (err) {
      console.error(err); // Log the error
      showToast('Failed to add money', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.balanceCard}>
        <h2>Total Balance</h2>
        <p className={styles.amount}>₹{balance.toFixed(2)}</p>
      </div>

      <div className={styles.addMoneySection}>
        <h3>Add Money to Wallet</h3>
        <div className={styles.presetButtons}>
          {[100, 200, 500, 1000].map(val => (
            <button key={val} onClick={() => setAmount(val.toString())}>+₹{val}</button>
          ))}
        </div>
        <div className={styles.inputGroup}>
          <input 
            type="number" 
            placeholder="Enter amount" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleAddMoney} disabled={loading}>
            {loading ? 'Processing...' : 'Add Money'}
          </button>
        </div>
      </div>

      <div className={styles.historySection}>
        <h3>Recent Transactions</h3>
        <div>
          {transactions.map(tx => (
            <div key={tx.id} className={styles.transaction}>
              <div className={styles.info}>
                <p>{tx.description}</p>
                <small>{new Date(tx.createdAt).toLocaleDateString()}</small>
              </div>
              <div className={`${styles.value} ${tx.type === 'CREDIT' ? styles.credit : styles.debit}`}>
                {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
              </div>
            </div>
          ))}
          {transactions.length === 0 && <p style={{textAlign: 'center', color: '#999'}}>No transactions yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;