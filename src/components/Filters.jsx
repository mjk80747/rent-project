import './Filters.css';

const Filters = ({ filters, setFilters, onApply }) => {

  const handleClear = () => {
    setFilters({
      sortBy: '',
      sharingType: '',
      gender: '',
      price: 60000,
      amenities: []
    });
  };

  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFilters(prev => {
      if (prev.amenities.includes(amenity)) {
        return { ...prev, amenities: prev.amenities.filter(a => a !== amenity) };
      } else {
        return { ...prev, amenities: [...prev.amenities, amenity] };
      }
    });
  };

  return (
    <div className="filters-container glass-panel">
      <div className="filters-header">
        <h3>Filters</h3>
        <button 
          className="clear-btn" 
          onClick={handleClear}
          style={{ color: '#EF4444', fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.15)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
        >
          Clear All
        </button>
      </div>

      {/* Sort By */}
      <div className="filter-section border-top">
        <h4>Sort By</h4>
        <div className="radio-group">
          <label className="radio-label">
            <input type="radio" name="sortBy" checked={filters.sortBy === 'lowToHigh'} onChange={() => handleChange('sortBy', 'lowToHigh')} />
            <span className="radio-custom"></span> Price: Low to High
          </label>
          <label className="radio-label">
            <input type="radio" name="sortBy" checked={filters.sortBy === 'highToLow'} onChange={() => handleChange('sortBy', 'highToLow')} />
            <span className="radio-custom"></span> Price: High to Low
          </label>
        </div>
      </div>

      {/* Sharing Types */}
      <div className="filter-section border-top">
        <h4>Sharing Types</h4>
        <div className="radio-group">
          <label className="radio-label">
            <input type="radio" name="sharing" checked={filters.sharingType === 'Private'} onChange={() => handleChange('sharingType', 'Private')} />
            <span className="radio-custom"></span> Private
          </label>
          <label className="radio-label">
            <input type="radio" name="sharing" checked={filters.sharingType === '2 Sharing'} onChange={() => handleChange('sharingType', '2 Sharing')} />
            <span className="radio-custom"></span> 2 Sharing
          </label>
          <label className="radio-label">
            <input type="radio" name="sharing" checked={filters.sharingType === '3 Sharing'} onChange={() => handleChange('sharingType', '3 Sharing')} />
            <span className="radio-custom"></span> 3 Sharing
          </label>
          <label className="radio-label">
            <input type="radio" name="sharing" checked={filters.sharingType === 'More than 3 Sharing'} onChange={() => handleChange('sharingType', 'More than 3 Sharing')} />
            <span className="radio-custom"></span> More than 3 Sharing
          </label>
        </div>
      </div>

      {/* Gender */}
      <div className="filter-section border-top">
        <h4>Gender</h4>
        <div className="radio-group">
          <label className="radio-label">
            <input type="radio" name="gender" checked={filters.gender === 'Men'} onChange={() => handleChange('gender', 'Men')} />
            <span className="radio-custom"></span> Men
          </label>
          <label className="radio-label">
            <input type="radio" name="gender" checked={filters.gender === 'Women'} onChange={() => handleChange('gender', 'Women')} />
            <span className="radio-custom"></span> Women
          </label>
          <label className="radio-label">
            <input type="radio" name="gender" checked={filters.gender === 'Unisex'} onChange={() => handleChange('gender', 'Unisex')} />
            <span className="radio-custom"></span> Unisex
          </label>
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-section border-top">
        <h4>Price Range</h4>
        <div className="price-display">
          <span>Rs. 0</span>
          <span>Rs. {filters.price}</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="60000" 
          step="1000" 
          value={filters.price} 
          onChange={(e) => handleChange('price', e.target.value)} 
          className="price-slider" 
        />
      </div>

      {/* Amenities */}
      <div className="filter-section border-top">
        <h4>Amenities</h4>
        <div className="checkbox-group">
          {['AC', 'Gym', 'Food', 'Fridge', 'Parking', 'Power Backup'].map(amenity => (
            <label className="checkbox-label" key={amenity}>
              <input 
                type="checkbox" 
                checked={filters.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
              />
              <span className="checkbox-custom"></span> {amenity}
            </label>
          ))}
        </div>
      </div>


      <div className="filter-section border-top" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <button 
          className="btn-primary" 
          onClick={onApply} 
          style={{ width: '100%', padding: '0.8rem', fontWeight: 'bold' }}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default Filters;
