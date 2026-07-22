import { useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });
const quito = [-0.180653, -78.467834];

const Recenter = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    const valid = points.filter(Boolean);
    if (valid.length === 1) map.setView(valid[0], 15);
    if (valid.length > 1) map.fitBounds(valid, { padding: [45, 45] });
  }, [map, points]);
  return null;
};

const OrderMap = ({ delivery, driver, route = [] }) => {
  const deliveryPosition = delivery?.coordinates?.length === 2 ? [delivery.coordinates[1], delivery.coordinates[0]] : null;
  const driverPosition = driver?.coordinates?.length === 2 ? [driver.coordinates[1], driver.coordinates[0]] : null;
  const routePositions = route.map(([lng, lat]) => [lat, lng]);
  return (
    <div className="map-card">
      <MapContainer center={deliveryPosition || driverPosition || quito} zoom={14} scrollWheelZoom>
        <TileLayer attribution={import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; OpenStreetMap contributors'} url={import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} />
        {deliveryPosition && <Marker position={deliveryPosition}><Popup>Destino de entrega</Popup></Marker>}
        {driverPosition && <Marker position={driverPosition}><Popup>Ubicación actual del repartidor</Popup></Marker>}
        {routePositions.length > 1 && <Polyline positions={routePositions} pathOptions={{ weight: 5 }} />}
        <Recenter points={[deliveryPosition, driverPosition]} />
      </MapContainer>
    </div>
  );
};
export default OrderMap;
