import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import styles from './AddressSelector.module.scss'; // We will create this scss

interface Address {
  id: string;
  street: string;
  city: string;
  zip: string;
}

interface AddressSelectorProps {
  selectedAddressId: string | null;
  onSelect: (id: string) => void;
}

const AddressSelector = ({ selectedAddressId, onSelect }: AddressSelectorProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: '', city: '', zip: '' });

  // Fetch user addresses
  useEffect(() => {
    apiClient.get('/users/addresses').then(res => setAddresses(res.data));
  }, []);

  const handleAddAddress = async () => {
    const { data } = await apiClient.post('/users/addresses', newAddress);
    setAddresses([...addresses, data]);
    onSelect(data.id); // Auto-select the new address
    setShowForm(false);
  };

  return (
    <div className={styles.container}>
      <h3>Delivery Address</h3>
      
      <div className={styles.list}>
        {addresses.map(addr => (
          <div 
            key={addr.id} 
            className={`${styles.card} ${selectedAddressId === addr.id ? styles.selected : ''}`}
            onClick={() => onSelect(addr.id)}
          >
            <p>{addr.street}</p>
            <p>{addr.city}, {addr.zip}</p>
          </div>
        ))}
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className={styles.addButton}>
          + Add New Address
        </button>
      ) : (
        <div className={styles.form}>
          <input 
            placeholder="Street Address" 
            value={newAddress.street}
            onChange={e => setNewAddress({...newAddress, street: e.target.value})}
          />
          <input 
            placeholder="City" 
            value={newAddress.city}
            onChange={e => setNewAddress({...newAddress, city: e.target.value})}
          />
          <input 
            placeholder="Zip Code" 
            value={newAddress.zip}
            onChange={e => setNewAddress({...newAddress, zip: e.target.value})}
          />
          <button onClick={handleAddAddress} className={styles.saveButton}>Save Address</button>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;