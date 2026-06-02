import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

const MapViewer = ({ properties, selectedArea }) => {
  // Approximate coordinates for Bangalore areas
  const areaCoords = {
    'Bellandur': [12.9304, 77.6784],
    'Electronic City': [12.8452, 77.6602],
    'Whitefield': [12.9698, 77.7499],
    'K.R Puram': [13.0084, 77.6959],
    'Varthur': [12.9406, 77.7470],
    'Yelahanka': [13.1007, 77.5963],
    'Kaggadasapura': [12.9841, 77.6784],
    'Brookefield': [12.9666, 77.7176],
  };

  const defaultCenter = [12.9716, 77.5946]; // Bangalore center
  const center = selectedArea && areaCoords[selectedArea] ? areaCoords[selectedArea] : defaultCenter;

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '20px' }}>
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        {properties.slice(0, 50).map((p, idx) => {
          // Spread properties slightly around the area center so pins don't overlap totally
          const areaCenter = areaCoords[p.area_name] || defaultCenter;
          const jitterX = ((idx % 5) - 2) * 0.004;
          const jitterY = (((idx + 1) % 3) - 1) * 0.004;
          const lat = areaCenter[0] + jitterX;
          const lng = areaCenter[1] + jitterY;

          return (
            <Marker key={idx} position={[lat, lng]}>
              <Popup>
                <strong style={{color: '#333'}}>{p.title}</strong><br/>
                <span style={{color: '#666'}}>{p.price}</span>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapViewer;
