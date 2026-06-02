import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import PropertyCard, { SkeletonCard } from './components/PropertyCard';
import { Toaster, toast } from 'react-hot-toast';
import { ArrowUp } from 'lucide-react';
import Filters from './components/Filters';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // New features state
  const [isDark, setIsDark] = useState(true);
  const [savedProperties, setSavedProperties] = useState([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  
  const [user, setUser] = useState({ name: 'Guest User', phone: '+91 0000000000' });
  const [scheduledVisits, setScheduledVisits] = useState([]);

  const [filters, setFilters] = useState({
    sortBy: '',
    sharingType: '',
    gender: '',
    price: 60000,
    amenities: []
  });

  // Helper function to get user-specific localStorage key
  const getUserKey = useCallback((key) => {
    return user?.id ? `${key}_${user.id}` : key;
  }, [user?.id]);

  const fetchProperties = useCallback((query = '') => {
    setLoading(true);
    const isDev = window.location.hostname === 'localhost';
    const API_BASE_URL = isDev ? 'http://localhost:5000' : '';
    const url = query ? `${API_BASE_URL}/api/properties?search=${query}` : `${API_BASE_URL}/api/properties`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProperties(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch properties:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchProperties();
    // Load local storage states
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setIsDark(false);
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Load user-specific data after setting user
      const userWishlist = localStorage.getItem(getUserKey('wishlist'));
      if (userWishlist) setSavedProperties(JSON.parse(userWishlist));
      
      const userVisits = localStorage.getItem(getUserKey('scheduledVisits'));
      if (userVisits) setScheduledVisits(JSON.parse(userVisits));
    }

    // Scroll listener
    const checkScrollTop = () => {
      if (window.pageYOffset > 400) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [fetchProperties, getUserKey]);

  const scrollTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Load user-specific data when user changes
  useEffect(() => {
    if (user?.id) {
      const userWishlist = localStorage.getItem(`wishlist_${user.id}`);
      if (userWishlist) {
        setSavedProperties(JSON.parse(userWishlist));
      } else {
        setSavedProperties([]);
      }
      
      const userVisits = localStorage.getItem(`scheduledVisits_${user.id}`);
      if (userVisits) {
        setScheduledVisits(JSON.parse(userVisits));
      } else {
        setScheduledVisits([]);
      }
    }
  }, [user?.id]);

  const handleLoginSuccess = (userData) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Load user-specific wishlist and visits
      const userWishlist = localStorage.getItem(`wishlist_${userData.id}`);
      if (userWishlist) {
        setSavedProperties(JSON.parse(userWishlist));
      } else {
        setSavedProperties([]); // Clear wishlist for new user
      }
      
      const userVisits = localStorage.getItem(`scheduledVisits_${userData.id}`);
      if (userVisits) {
        setScheduledVisits(JSON.parse(userVisits));
      } else {
        setScheduledVisits([]); // Clear visits for new user
      }
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear user-specific data
    localStorage.removeItem('user');
    setUser({ name: 'Guest User', phone: '+91 0000000000' });
    setSavedProperties([]);
    setScheduledVisits([]);
    setIsAuthenticated(false);
    setShowProfile(false);
    setShowWishlist(false);
  };

  const handleToggleSave = (property) => {
    setSavedProperties(prev => {
      const isAlreadySaved = prev.some(p => p.id === property.id);
      const updated = isAlreadySaved ? prev.filter(p => p.id !== property.id) : [...prev, property];
      // Save to user-specific localStorage key
      localStorage.setItem(getUserKey('wishlist'), JSON.stringify(updated));
      return updated;
    });
  };

  const handleScheduleVisit = (property, date) => {
    const newVisit = { property, date, status: 'Upcoming' };
    setScheduledVisits(prev => {
      const updated = [...prev, newVisit];
      localStorage.setItem(getUserKey('scheduledVisits'), JSON.stringify(updated));
      return updated;
    });
    toast.success('Visit successfully scheduled! The owner will be notified.', {
      duration: 3000,
      position: 'bottom-center'
    });
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    fetchProperties(searchInput);
    setSelectedArea(''); 
    setShowWishlist(false);
    setShowProfile(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const areas = ['Bellandur', 'Electronic City', 'K.R Puram', 'Varthur', 'Yelahanka', 'Kaggadasapura', 'Brookefield', 'Whitefield'];

  const filteredProperties = (() => {
    let result = properties.filter(p => {
      if (selectedArea && p.area_name !== selectedArea) return false;
      const details = p.details ? JSON.parse(p.details) : {};
      const typeStr = details.type || 'BHK2';
      const rent = details.rent ? parseFloat(details.rent) : 20000;
      if (rent > filters.price) return false;
      if (filters.gender === 'Men' || filters.gender === 'Women') {
        if (details.lease_type === 'FAMILY') return false; 
      }
      if (filters.sharingType) {
        if (filters.sharingType === 'Private' && typeStr !== 'BHK1' && typeStr !== 'RK1') return false;
        if (filters.sharingType === '2 Sharing' && typeStr !== 'BHK2') return false;
        if (filters.sharingType === '3 Sharing' && typeStr !== 'BHK3') return false;
        if (filters.sharingType === 'More than 3 Sharing' && typeStr !== 'BHK4' && typeStr !== 'BHK4PLUS') return false;
      }
      if (filters.amenities.length > 0) {
        if (filters.amenities.includes('Gym') && details.gym != 1) return false;
        if (filters.amenities.includes('Parking') && details.parking === 'NONE') return false;
      }
      return true;
    });

    if (filters.sortBy === 'lowToHigh') {
      result.sort((a,b) => {
        const aRent = a.details ? JSON.parse(a.details).rent || 20000 : 20000;
        const bRent = b.details ? JSON.parse(b.details).rent || 20000 : 20000;
        return aRent - bRent;
      });
    } else if (filters.sortBy === 'highToLow') {
      result.sort((a,b) => {
        const aRent = a.details ? JSON.parse(a.details).rent || 20000 : 20000;
        const bRent = b.details ? JSON.parse(b.details).rent || 20000 : 20000;
        return bRent - aRent;
      });
    }

    return result;
  })();

  if (!isAuthenticated) {
    return (
      <>
        <Toaster />
        <Auth onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <div className="app-wrapper">
      <Toaster />
      <Header 
        onLogout={handleLogout} 
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        savedCount={savedProperties.length}
        onShowWishlist={(show) => { setShowWishlist(show); setShowProfile(false); setSelectedArea(''); setSearchQuery(''); }}
        onShowProfile={() => { setShowProfile(true); setShowWishlist(false); setSelectedArea(''); setSearchQuery(''); }}
      />
      
      <main className="main-content">
        {showProfile ? (
          // USER PROFILE DASHBOARD
          <section className="profile-dashboard container" style={{ padding: '40px 0' }}>
            <div className="section-header" style={{ marginBottom: '24px' }}>
              <h2 className="section-title">My Dashboard</h2>
              <button className="btn-secondary" onClick={() => setShowProfile(false)}>← Back to Home</button>
            </div>
            
            <div className="layout-with-sidebar">
              {/* Profile Card Sidebar */}
              <div className="filters-sidebar glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #818cf8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', margin: '0 auto 16px' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'G'}
                </div>
                <h3 style={{ textAlign: 'center', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{user?.name || 'Guest User'}</h3>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>{user?.email || 'guest@example.com'}</p>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>+91 {user?.phone || '0000000000'}</p>
                <div style={{ padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
                   <p style={{ display: 'flex', justifyContent: 'space-between', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>
                     <span>Saved PGs</span> <strong style={{ color: 'var(--text-primary)' }}>{savedProperties.length}</strong>
                   </p>
                   <p style={{ display: 'flex', justifyContent: 'space-between', margin: 0, color: 'var(--text-secondary)' }}>
                     <span>Scheduled Visits</span> <strong style={{ color: 'var(--text-primary)' }}>{scheduledVisits.length}</strong>
                   </p>
                </div>
                <button className="btn-primary" style={{ width: '100%', marginBottom: '12px' }} onClick={() => { setShowProfile(false); setShowWishlist(true); }}>View My Wishlist</button>
                <button className="btn-secondary" style={{ width: '100%' }} onClick={handleLogout}>Sign Out</button>
              </div>

              {/* Main Content Area */}
              <div className="properties-grid" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0', fontSize: '1.5rem' }}>Past & Upcoming Visits</h3>
                {scheduledVisits.length > 0 ? (
                  scheduledVisits.map((visit, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{visit.property.title}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>{visit.property.location}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                          📅 {visit.date}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: '12px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>You haven't scheduled any visits yet. When you request a visit, it will appear here!</p>
                  </div>
                )}
              </div>
            </div>
          </section>

        ) : showWishlist ? (
          // WISHLIST VIEW
          <section className="container" style={{ padding: '40px 0' }}>
            <div className="results-header-container">
              <div className="results-header-center">
                <h2 className="section-title">My Wishlist</h2>
                <p className="section-desc">You have saved {savedProperties.length} properties.</p>
              </div>
              <div className="results-header-right">
                <button className="btn-secondary" onClick={() => setShowWishlist(false)}>← Back</button>
              </div>
            </div>

            <div className="properties-grid" style={{ marginTop: '2rem' }}>
              {savedProperties.length > 0 ? (
                savedProperties.map((property, idx) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    isSaved={true} 
                    onToggleSave={handleToggleSave} 
                    onScheduleVisit={handleScheduleVisit}
                    idx={idx}
                  />
                ))
              ) : (
                <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '4rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏜️</div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Your Wishlist is Empty</h3>
                  <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Looks like you haven't saved any PGs yet.</p>
                  <button className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block', width: 'auto', padding: '12px 24px' }} onClick={() => setShowWishlist(false)}>Explore PGs</button>
                </div>
              )}
            </div>
          </section>

        ) : !selectedArea && !searchQuery ? (
          // LOCATION SELECT VIEW
          <section className="hero-section">
            <div className="container">
              <div className="hero-content">
                <span className="badge-new">PG Management Systems</span>
                <h2 className="hero-title">
                  Discover Top PGs in <span className="highlight-text">Bangalore</span>
                </h2>
                <p className="hero-subtitle">
                  Select a location below to view all available PG accommodations loaded directly from the datasets.
                </p>
                
                <div className="search-bar glass-panel" style={{ position: 'relative', overflow: 'visible' }}>
                  <div className="search-input">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input 
                      type="text" 
                      placeholder="Search by location (e.g., Bellandur)..." 
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                  <button className="btn-primary search-btn" onClick={handleSearch}>Search</button>

                  {/* Custom Suggestions Dropdown */}
                  {showSuggestions && searchInput && (
                    <div className="suggestions-dropdown" style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      backgroundColor: 'var(--surface)', borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)', marginTop: '8px', zIndex: 100, maxHeight: '250px', overflowY: 'auto'
                    }}>
                      {areas.filter(a => a.toLowerCase().includes(searchInput.toLowerCase())).length > 0 ? (
                        areas.filter(a => a.toLowerCase().includes(searchInput.toLowerCase())).map((area) => (
                          <div 
                            key={area}
                            style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s', color: 'var(--text-primary)' }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSearchInput(area);
                              setSearchQuery(area);
                              fetchProperties(area);
                              setSelectedArea('');
                              setShowSuggestions(false);
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            {area}
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>No locations found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="locations-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '4rem'
              }}>
                {areas.map((area) => (
                  <div 
                    key={area} 
                    className="location-card glass-panel"
                    onClick={() => setSelectedArea(area)}
                    style={{
                      padding: '2rem', textAlign: 'center', cursor: 'pointer', borderRadius: '12px',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{area}</h3>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Explore Neighborhood</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          // RESULTS VIEW
          <section className="properties-section container">
            <div className="results-header-container" style={{ marginTop: '2rem' }}>
                <div className="results-header-left">
                  <button 
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    className="btn-secondary filter-toggle-btn"
                  >
                    <span style={{ display: 'inline-block', transition: 'transform 0.4s ease', transform: isFiltersOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                      {isFiltersOpen ? '✕' : '☰'}
                    </span>
                  </button>
                </div>
                
                <div className="results-header-center">
                  <h2 className="section-title" style={{ marginBottom: '5px' }}>
                    {searchQuery ? 'Search Results' : `${selectedArea} Properties`}
                  </h2>
                  <p className="section-desc" style={{ margin: 0 }}>Discovering {filteredProperties.length} stunning PGs.</p>
                </div>
                
                <div className="results-header-right">
                  <button 
                     className="btn-secondary" 
                     onClick={() => { setSelectedArea(''); setSearchQuery(''); }}
                  >
                    ← Back
                  </button>
                </div>
            </div>

            <div className="layout-with-sidebar">
              {isFiltersOpen && (
                <aside className="filters-sidebar">
                  <Filters 
                    filters={filters} 
                    setFilters={setFilters} 
                    onApply={() => setIsFiltersOpen(false)} 
                  />
                </aside>
              )}
              
              <div className="properties-grid" style={{ flexGrow: 1 }}>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                ) : filteredProperties.length > 0 ? (
                  filteredProperties.map((property, idx) => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      isSaved={savedProperties.some(p => p.id === property.id)}
                      onToggleSave={handleToggleSave}
                      onScheduleVisit={handleScheduleVisit}
                      idx={idx}
                    />
                  ))
                ) : (
                  <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '4rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No PGs Found</h3>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>We couldn't find any properties matching your specific criteria.</p>
                    <button className="btn-outline" style={{ marginTop: '1.5rem', width: 'auto', display: 'inline-block', padding: '12px 24px' }} onClick={() => setIsFiltersOpen(true)}>Adjust Filters</button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer border-top">
        <div className="container">
          <div className="footer-content">
            <div className="brand-info">
              <h2>PG Management<span className="accent">System</span></h2>
              <p>Your premium partner for finding the perfect, verified PG accommodation in Bangalore.</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 PG Management System. Crafted with care for daily lives.</p>
          </div>
        </div>
      </footer>

      <button 
        className={`scroll-to-top ${showScroll ? 'visible' : ''}`}
        onClick={scrollTop}
        data-tip="Back to Top"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
}

export default App;
