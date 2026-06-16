import { useEffect, useState } from 'react';
import { Heart, Sun, Moon, User } from 'lucide-react';
import './Header.css';

const Header = ({ onToggleTheme, isDark, savedCount, onShowWishlist, onShowProfile }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`app-header${scrolled ? ' scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo" onClick={() => onShowWishlist(false)} style={{cursor: 'pointer'}}>
          <h1>PG Management<span className="accent">System</span></h1>
        </div>

        <div className="auth-buttons">
          <button className="icon-btn theme-btn" onClick={onToggleTheme} data-tip="Toggle Theme">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className="icon-btn wishlist-nav" onClick={() => onShowWishlist(true)} data-tip="View Wishlist">
            <Heart size={20} />
            {savedCount > 0 && <span className="wishlist-badge">{savedCount}</span>}
          </button>

          <button className="icon-btn profile-nav" onClick={() => onShowProfile(true)} data-tip="User Profile">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
