import React, { useEffect, useRef } from "react";
import { Card, Table, Tag, Typography } from "antd";
import { initializeMap, updateMapLocation } from "../../utils/MapsUtil";
import { fromLonLat } from "ol/proj";

// Import komponen styling dari OpenLayers yang diperlukan
import { Feature } from "ol";
import { Point, LineString } from "ol/geom";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";

const { Text } = Typography;

const ProjectMap = ({ currentLocation, photoLocation, activeTerm }) => {
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const markerLayerRef = useRef(null);
  const lineLayerRef = useRef(null);

  // Memoized version of updateMapLocation from mapUtils
  const mapUpdater = (lat, lng, zoom = 14) => {
    updateMapLocation(mapObjRef.current, markerLayerRef.current, lat, lng, zoom);
  };

  // 1. Initialize Map Effect (runs once when data is available)
  useEffect(() => {
    if (!mapRef.current || mapObjRef.current || !currentLocation) return;

    const { map, markerLayer, lineLayer } = initializeMap(
      mapRef.current,
      currentLocation.latitude,
      currentLocation.longitude
    );

    mapObjRef.current = map;
    markerLayerRef.current = markerLayer;
    lineLayerRef.current = lineLayer;

    mapUpdater(currentLocation.latitude, currentLocation.longitude);
  }, [currentLocation]); // Re-run if currentLocation changes significantly (e.g., first load)

  // 2. Update Map Location Effect (runs on active index change)
  useEffect(() => {
    if (currentLocation) {
      mapUpdater(currentLocation.latitude, currentLocation.longitude, 16);
    }
  }, [currentLocation]);

  // 3. NEW: Draw Line and Photo Marker Effect
  useEffect(() => {
    if (!mapObjRef.current || !lineLayerRef.current || !markerLayerRef.current) return;

    const lineSource = lineLayerRef.current.getSource();
    const markerSource = markerLayerRef.current.getSource(); // The project marker layer

    lineSource.clear(); // Clear old line
    
    // Clear only the photo marker if it exists (assuming project marker is the first feature)
    if (markerSource.getFeatures().length > 1) { 
      markerSource.removeFeature(markerSource.getFeatures()[1]);
    }
    
    // Ambil koordinat dari photoLocation atau dari activeTerm.progressDocuments[0]
    const photoCoordinates = photoLocation 
      ? { lat: photoLocation.lat, lng: photoLocation.lng }
      : activeTerm?.progressDocuments?.[0]?.photoCoordinates;

    if (photoCoordinates) {
      let photoLat, photoLng;
      
      // Parse koordinat (bisa dari string atau object)
      if (typeof photoCoordinates === 'string') {
        const [lat, lng] = photoCoordinates.split(',').map(c => parseFloat(c.trim()));
        photoLat = lat;
        photoLng = lng;
      } else {
        photoLat = photoCoordinates.lat;
        photoLng = photoCoordinates.lng;
      }

      const projLat = parseFloat(currentLocation.latitude);
      const projLng = parseFloat(currentLocation.longitude);
      const photoCoord = fromLonLat([photoLng, photoLat]);
      const projectCoord = fromLonLat([projLng, projLat]);

      // 3a. Draw the Line
      const lineFeature = new Feature({
        geometry: new LineString([projectCoord, photoCoord]),
      });
      lineFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: 'rgba(255, 0, 0, 0.7)',
            width: 4,
            lineDash: [10, 5],
          }),
        })
      );
      lineSource.addFeature(lineFeature);
      
      // 3b. Add Photo Location Marker
      const photoMarker = new Feature({ geometry: new Point(photoCoord) });
      photoMarker.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: 'rgba(0, 100, 255, 0.8)' }),
            stroke: new Stroke({ color: 'white', width: 2 }),
          }),
        })
      );
      markerSource.addFeature(photoMarker);
      
      // Optionally, fit the map view to both points
      const extent = lineSource.getExtent();
      mapObjRef.current.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 1000,
        maxZoom: 16
      });

    } else {
      // When no photo data, reset view to project location
      mapUpdater(currentLocation.latitude, currentLocation.longitude, 16);
    }
  }, [photoLocation, activeTerm, currentLocation]); 


  return (
    <>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "400px" }}
        className="rounded-xl overflow-hidden border border-gray-300 shadow-lg"
      />
    </>
  );
};

export default ProjectMap;