import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import styles from './MainLayout.module.scss';
import { useState, useEffect, useRef } from 'react';

const MainLayout = () => {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/auth/login');
  };
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.navBrand}>QuickCart</Link>
        <div className={styles.navLinks}>
          {user && (
            <>
              <Link to="/my-orders" className={styles.navLink}>My Orders</Link>
              
              {user.role === 'ADMIN' && (
                 <Link to="/admin" className={styles.navLink}>Admin</Link>
              )}
              
              <div className={styles.profileContainer} ref={dropdownRef}>
                <div 
                  className={styles.profileIcon}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {getInitials(user.name)}
                </div>

                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <Link 
                      to="/profile" 
                      className={styles.dropdownItem}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    
                    {/* vvv THIS IS THE CHANGE vvv */}
                    <Link 
                      to="/profile/update-password" // Point to the new page
                      className={styles.dropdownItem}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Update Password
                    </Link>
                    {/* ^^^ END CHANGE ^^^ */}

                    <button 
                      onClick={handleLogout} 
                      className={styles.dropdownItem}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {!user && (
            <Link to="/auth/login" className={styles.navLink}>Login</Link>
          )}
          <Link to="/cart" className={styles.navLink}>
            Cart <span className={styles.cartCount}>{itemCount}</span>
          </Link>
        </div>
      </nav>
      <main style={{ padding: '20px 30px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;