import exifr from "exifr";
import { message, Modal } from "antd";

/**
 * 🔹 Hitung jarak antar koordinat (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // meter
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * 🔹 Ambil lokasi user dari browser (fallback)
 */
export const getUserLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation tidak didukung di browser ini."));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });

/**
 * 🔹 Ambil koordinat dari metadata foto (EXIF) atau fallback
 */
export const getPhotoAndDistance = async (file, projectLatitude, projectLongitude, form) => {
  try {
    let coords = null;
    let source = "unknown";

    // 🔹 Coba baca EXIF
    try {
      const gps = await exifr.gps(file);
      if (gps && gps.latitude && gps.longitude) {
        coords = { lat: gps.latitude, lng: gps.longitude };
        source = "metadata";
      }
    } catch (exifErr) {
      console.warn("⚠️ Tidak ada EXIF GPS:", exifErr.message);
    }

    // 🔹 Jika EXIF gagal → fallback ke lokasi perangkat
    if (!coords) {
      try {
        const userLoc = await getUserLocation();
        coords = { lat: userLoc.latitude, lng: userLoc.longitude };
        source = "geolocation";
      } catch {
        // 🔹 Fallback terakhir → gunakan lokasi proyek agar tetap valid
        message.warning("Tidak dapat membaca lokasi foto. Menggunakan lokasi proyek sebagai fallback.");
        coords = { lat: parseFloat(projectLatitude), lng: parseFloat(projectLongitude) };
        source = "manual";
      }
    }

    const projLat = parseFloat(projectLatitude);
    const projLng = parseFloat(projectLongitude);
    const distance = calculateDistance(coords.lat, coords.lng, projLat, projLng);

    // 🔹 Validasi jarak abnormal
    if (distance > 5000) {
      Modal.warning({
        title: "Lokasi foto mencurigakan ⚠️",
        content: `Foto ini diambil ${Math.round(distance / 1000)} km dari lokasi proyek.
Pastikan GPS aktif atau gunakan foto dari lokasi proyek.`,
      });
    }

    // 🔹 Set ke form
    form.setFieldsValue({
      photoCoordinates: `${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`,
      distanceFromLocation: parseFloat(distance.toFixed(2)),
    });

    console.log("📍 Lokasi foto:", coords, "| Source:", source, "| Distance:", distance);
    return { coords, distance, source };

  } catch (err) {
    console.error("❌ Gagal memproses foto:", err);
    message.error("Gagal membaca data foto. Pastikan izin lokasi aktif.");
    return null;
  }
};
