import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { FaMapMarkerAlt, FaMotorcycle } from 'react-icons/fa';
import { OpenLocationCode } from 'open-location-code';

// Remove default Leaflet marker icon globally
// This ensures no default marker image is loaded
// and only custom icons are used
// (do this before any marker is rendered)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: ''
});

// Custom DivIcon for customer (red location icon)
const customerIcon = new L.DivIcon({
  html: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='#e74c3c' viewBox='0 0 24 24'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/></svg>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Custom DivIcon for provider (green location icon)
const providerIcon = new L.DivIcon({
  html: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='#27ae60' viewBox='0 0 24 24'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/></svg>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Routing component for OSRM
const Routing = ({ from, to }) => {
  const map = useMap();
  useEffect(() => {
    if (!from || !to) return;
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(from[0], from[1]),
        L.latLng(to[0], to[1])
      ],
      routeWhileDragging: false,
      show: true,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: { styles: [{ color: '#0074D9', weight: 5 }] },
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      createMarker: function(i, wp, nWps) {
        // i === 0: provider, i === 1: customer
        if (i === 0) {
          return L.marker(wp.latLng, { icon: providerIcon });
        } else {
          return L.marker(wp.latLng, { icon: customerIcon });
        }
      }
    }).addTo(map);
    return () => {
      if (map && routingControl && map.hasLayer(routingControl)) {
        map.removeControl(routingControl);
      } else if (routingControl) {
        try {
          routingControl.remove();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [from, to, map]);
  return null;
};

/**
 * Props:
 * - latitude, longitude, address, plusCode (customer)
 * - providerLatitude, providerLongitude, providerName, providerPlusCode (provider)
 */
const CustomerMap = ({ latitude, longitude, address, plusCode, providerLatitude, providerLongitude, providerName, providerPlusCode }) => {
  // Fallback to plusCode for customer
  let lat = parseFloat(latitude);
  let lng = parseFloat(longitude);
  if ((isNaN(lat) || isNaN(lng)) && plusCode) {
    try {
      const olc = new OpenLocationCode();
      const decoded = olc.decode(plusCode);
      lat = decoded.latitudeCenter;
      lng = decoded.longitudeCenter;
    } catch (e) {}
  }
  // Fallback to plusCode for provider
  let plat = parseFloat(providerLatitude);
  let plng = parseFloat(providerLongitude);
  if ((isNaN(plat) || isNaN(plng)) && providerPlusCode) {
    try {
      const olc = new OpenLocationCode();
      const decoded = olc.decode(providerPlusCode);
      plat = decoded.latitudeCenter;
      plng = decoded.longitudeCenter;
    } catch (e) {}
  }
  if (!lat || !lng || !plat || !plng || isNaN(lat) || isNaN(lng) || isNaN(plat) || isNaN(plng)) {
    return (
      <div style={{ color: 'red', margin: '1rem 0' }}>
        Location not available for this customer or provider.
      </div>
    );
  }
  return (
    <div className="map-container" style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />
        <Marker position={[lat, lng]} icon={customerIcon}>
          <Popup>{address || 'Customer Location'}</Popup>
        </Marker>
        <Marker position={[plat, plng]} icon={providerIcon}>
          <Popup>{providerName || 'Service Provider'}</Popup>
        </Marker>
        <Routing from={[plat, plng]} to={[lat, lng]} />
      </MapContainer>
    </div>
  );
};

export default CustomerMap; 