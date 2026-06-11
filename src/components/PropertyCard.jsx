import { useState } from 'react';
import { motion as Motion } from 'motion/react';
import { Heart, ChevronLeft, ChevronRight, Star, MapPin, Check, Phone } from 'lucide-react';
import { EASE } from '../animations/variants';
import './PropertyCard.css';

export const SkeletonCard = () => (
  <div className="skeleton">
    <div className="skeleton-img shimmer"></div>
    <div className="skeleton-content">
      <div className="skeleton-text title shimmer"></div>
      <div className="skeleton-text medium shimmer"></div>
      <div className="skeleton-text short shimmer" style={{ marginBottom: '24px' }}></div>
      <div className="skeleton-row">
        <div className="skeleton-text shimmer"></div>
        <div className="skeleton-text shimmer"></div>
        <div className="skeleton-text shimmer"></div>
      </div>
      <div className="skeleton-row" style={{ marginTop: 'auto', marginBottom: 0 }}>
        <div className="skeleton-text btn shimmer"></div>
        <div className="skeleton-text btn shimmer"></div>
      </div>
    </div>
  </div>
);

const PropertyCard = ({ property, isSaved, onToggleSave, onScheduleVisit, idx = 0 }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [imageIdx, setImageIdx] = useState(0);
  const [visitDate, setVisitDate] = useState('');

  // MOCK CAROUSEL IMAGES
  const images = property.images || [
    property.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1de2d93688?w=500&q=80'
  ];

  const nextImage = (e) => {
    e.stopPropagation();
    setImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  const prevImage = (e) => {
    e.stopPropagation();
    setImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // MOCKS
  const generateHash = (str) => {
    let hash = 0;
    if (!str) return 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
  };
  const hashVal = generateHash((property.title || '') + (property.location || ''));
  let computedRating = 3.5 + (hashVal % 16) / 10;
  if (computedRating > 5.0) computedRating = 5.0;
  const rating = computedRating.toFixed(1);
  const reviewsCount = 12 + (hashVal % 120);
  
  // Custom mock commute distance based on area
  const commute = {
    'Bellandur': '2.5 km to RMZ Ecospace',
    'Electronic City': '10 mins to Infosys Campus',
    'Whitefield': '3 km to ITPL',
    'K.R Puram': '5 mins to KR Puram Station'
  }[property.area_name] || '1.2 km to nearest Tech Park';

  let rawData = {};
  if (property.details) {
    try {
      rawData = JSON.parse(property.details);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <Motion.div
        className="property-card"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: EASE, delay: Math.min(idx, 7) * 0.08 }}
        whileHover={{ y: -8, scale: 1.03 }}
      >
        <div className="property-image-container">
          {/* Image Slider */}
          <img 
            src={images[imageIdx]} 
            alt={property.title} 
            className="property-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80';
            }}
          />
          
          <button className="carousel-btn left" onClick={prevImage}><ChevronLeft size={20}/></button>
          <button className="carousel-btn right" onClick={nextImage}><ChevronRight size={20}/></button>

          {/* Badges */}
          {property.featured && <span className="badge featured">Premium</span>}
          
          {/* Heart/Wishlist Button */}
          <button 
            className={`wishlist-btn ${isSaved ? 'saved' : ''}`}
            onClick={() => onToggleSave(property)}
            data-tip={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={20} fill={isSaved ? '#EF4444' : 'none'} color={isSaved ? '#EF4444' : '#fff'} />
          </button>

          <div className="price-tag">{property.price}</div>
        </div>
        
        <div className="property-content">
          <div className="card-header">
            <h3 className="property-title">{property.title}</h3>
            <div className="rating-badge">
              <Star size={14} fill="#F59E0B" color="#F59E0B"/> {rating} ({reviewsCount})
            </div>
          </div>

          <p className="property-location">
            <MapPin size={16} />
            {property.location}
          </p>

          <p className="commute-info">
            <Check size={14} color="#10B981" /> {commute}
          </p>
          
          <div className="property-features">
            <div className="feature">
              <span>🛏️ {property.bedrooms} Beds</span>
            </div>
            <div className="feature">
              <span>🚿 {property.bathrooms} Baths</span>
            </div>
            <div className="feature">
              <span>📐 {property.area}</span>
            </div>
          </div>
          
          <div className="action-buttons">
            <button 
              className="btn-outline view-details-btn" 
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Details'}
            </button>
            <button 
              className="btn-primary visit-btn"
              onClick={() => setShowModal(true)}
            >
              Schedule Visit
            </button>
          </div>

          {showDetails && (
            <div className="extended-details">
              <h4>Property Details</h4>
              <ul>
                {Object.entries(rawData).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key.replace('_', ' ')}:</strong> {value || 'N/A'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Motion.div>

      {/* Schedule Visit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="schedule-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Contact Owner / Schedule Visit</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>You are requesting a visit for <strong>{property.title}</strong> in {property.location}.</p>
              <form className="visit-form" onSubmit={(e) => { 
                  e.preventDefault(); 
                  if(onScheduleVisit) {
                    onScheduleVisit(property, visitDate);
                  } else {
                    alert('Visit Scheduled! The owner will contact you shortly.'); 
                  }
                  setShowModal(false); 
                }}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input type="text" placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="+91 9876543210" required />
                </div>
                <div className="form-group">
                  <label>Date of Visit</label>
                  <input type="date" required value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '10px'}}>
                  <Phone size={18} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
                  Request Callback
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyCard;
