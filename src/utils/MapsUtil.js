import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Feature } from "ol";
import { Point, LineString } from "ol/geom"; // Impor LineString
import { Style, Icon, Stroke, Fill, Circle as CircleStyle } from "ol/style"; // Impor Stroke, Fill, CircleStyle
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import "ol/ol.css";

/**
 * Menginisialisasi dan mengembalikan objek map OpenLayers, layer marker proyek, dan layer garis/marker foto.
 * @param {HTMLElement} mapElement
 * @param {string|number} initialLat - Latitude awal
 * @param {string|number} initialLng - Longitude awal
 * @returns {{map: Map, markerLayer: VectorLayer, lineLayer: VectorLayer}}
 */
export const initializeMap = (mapElement, initialLat, initialLng) => {
  const initialCenter = fromLonLat([
    parseFloat(initialLng),
    parseFloat(initialLat),
  ]);

  const map = new Map({
    target: mapElement,
    layers: [new TileLayer({ source: new OSM() })],
    view: new View({ center: initialCenter, zoom: 13 }),
  });

  // Layer 1: Untuk marker proyek utama
  const markerLayer = new VectorLayer({ source: new VectorSource() });
  map.addLayer(markerLayer);

  // Layer 2: Untuk garis dan marker lokasi foto (dinamis, akan dibersihkan/digambar ulang)
  const lineLayer = new VectorLayer({ source: new VectorSource() });
  map.addLayer(lineLayer);

  return { map, markerLayer, lineLayer };
};

/**
 * Mengupdate lokasi marker PROYEK dan posisi view map.
 * Layer lain (lineLayer) dikelola di komponen ProjectMap.
 * * @param {Map} mapObj
 * @param {VectorLayer} markerLayer - Layer marker proyek
 * @param {string|number} lat
 * @param {string|number} lng
 * @param {number} [zoom=14]
 */
export const updateMapLocation = (mapObj, markerLayer, lat, lng, zoom = 14) => {
  if (!mapObj || !markerLayer || !lat || !lng) return;

  const coordinate = fromLonLat([parseFloat(lng), parseFloat(lat)]);
  const source = markerLayer.getSource();

  // 1. Bersihkan marker proyek yang lama
  source.clear();
  
  // 2. Tambahkan marker proyek yang baru
  const marker = new Feature({ geometry: new Point(coordinate) });
  marker.setStyle(
    new Style({
      image: new Icon({
        src: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Icon Proyek
        scale: 0.08,
      }),
    })
  );

  source.addFeature(marker);
  
  // 3. Animasi tampilan peta
  mapObj.getView().animate({
    center: coordinate,
    zoom,
    duration: 1000,
  });
};