import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Style, Icon } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

export default function KoordinatProyek() {
  const mapRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState("");
  const mapObjRef = useRef(null);
  const markerLayerRef = useRef(null);

  // Inisialisasi Peta
  useEffect(() => {
    if (!mapRef.current) return;

    // Cegah re-init
    if (mapObjRef.current) return;

    const initialLocation = fromLonLat([107.60981, -6.914744]); // Default: Bandung
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: initialLocation,
        zoom: 14,
      }),
    });

    // Layer marker
    const markerLayer = new VectorLayer({
      source: new VectorSource(),
    });
    map.addLayer(markerLayer);
    markerLayerRef.current = markerLayer;

    mapObjRef.current = map;
  }, []);

  // Ambil lokasi dari browser
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung di browser ini.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocation({ lat, lng });
        setError("");

        const coordinate = fromLonLat([lng, lat]);

        // Bersihkan marker lama
        markerLayerRef.current.getSource().clear();

        // Tambahkan marker baru
        const marker = new Feature({
          geometry: new Point(coordinate),
        });
        marker.setStyle(
          new Style({
            image: new Icon({
              src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
              scale: 0.08,
            }),
          })
        );

        markerLayerRef.current.getSource().addFeature(marker);

        // Animasi zoom
        mapObjRef.current.getView().animate({
          center: coordinate,
          zoom: 18,
          duration: 1000,
        });
      },
      (err) => {
        setError("Gagal mendapatkan lokasi: " + err.message);
      }
    );
  };

  // Upload foto
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        Upload Foto Progres
      </h2>

      {/* Upload Foto */}
      <div className="flex flex-col items-center space-y-3">
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="block text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-100 file:text-blue-700
            hover:file:bg-blue-200"
        />

        {/* Preview Foto */}
        {photo && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 text-center">Preview Foto:</p>
            <img
              src={photo}
              alt="Preview"
              className="w-48 h-48 object-cover rounded-xl shadow-lg border border-gray-200"
            />
          </div>
        )}
      </div>

      {/* Tombol Ambil Lokasi */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleGetLocation}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md"
        >
          Ambil Lokasi Saya
        </button>
      </div>

      {/* Koordinat Lokasi */}
      {location.lat && (
        <div className="text-center text-green-700 font-medium">
          <p>Latitude: {location.lat}</p>
          <p>Longitude: {location.lng}</p>
        </div>
      )}

      {/* Peta */}
      <div
        ref={mapRef}
        style={{ width: "100%", height: "400px" }}
        className="rounded-xl overflow-hidden border border-gray-300 shadow-lg"
      />

      {/* Pesan Error */}
      {error && <p className="text-red-600 text-center mt-2">{error}</p>}
    </div>
  );
}
