
'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import type { LatLngExpression, LatLng } from 'leaflet';

interface MapPickerProps {
  initialPosition: LatLngExpression;
  onLocationChange: (latlng: { lat: number, lng: number }, address: string) => void;
}

function LocationMarker({ onLocationChange, position, setPosition }: { onLocationChange: MapPickerProps['onLocationChange'], position: LatLng, setPosition: React.Dispatch<React.SetStateAction<LatLng>> }) {
  const map = useMapEvents({
    click(e) {
      const newPos = e.latlng;
      setPosition(newPos);
      map.flyTo(newPos, map.getZoom());
      
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}`)
        .then(res => res.json())
        .then(data => {
            const address = data.display_name || 'Address not found';
            onLocationChange(newPos, address);
        }).catch(error => {
            console.error("Geocoding error:", error);
            onLocationChange(newPos, 'Could not fetch address');
        });
    },
  });

  return <Marker position={position}></Marker>;
}

export default function MapPicker({ initialPosition, onLocationChange }: MapPickerProps) {
  const [position, setPosition] = useState<LatLng>(() => {
    if (Array.isArray(initialPosition)) {
        return new (require('leaflet')).LatLng(initialPosition[0], initialPosition[1]);
    }
    return initialPosition as LatLng;
  });

  // Effect to handle reverse geocoding for the initial position
  useEffect(() => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
      .then(res => res.json())
      .then(data => {
          const address = data.display_name || 'Address not found';
          onLocationChange(position, address);
      }).catch(error => {
          console.error("Geocoding error:", error);
          onLocationChange(position, 'Could not fetch address');
      });
    // We only want to run this once on mount for the initial position
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationChange={onLocationChange} position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
}
