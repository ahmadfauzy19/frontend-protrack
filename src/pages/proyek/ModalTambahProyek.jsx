import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Space,
  message,
  Spin,
  Divider,
  Typography,
  Table,
  Button,
} from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { createProject } from "../../service/api/ProjectApi";
import { getAllLogicDisbursement } from "../../service/api/DeveloperApi";
import "../../assets/css/Developer.css";
import { useDeveloperDropdown } from "../../hook/UseDeveloperDropdown";
import MainLayout from "../../layouts/MainLayout";
import "leaflet/dist/leaflet.css";

const { Option } = Select;
const { Title } = Typography;

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// === Helper untuk nilai incremental per termin ===
const getTermDisbursementValue = (record, index, dataSource, totalFunding) => {
  if (!totalFunding) return 0;
  const list = Array.isArray(dataSource) ? dataSource : [];
  const current = parseFloat(record.cumulativePercentage || 0);
  const prev = index > 0 ? parseFloat(list[index - 1].cumulativePercentage || 0) : 0;
  const incrementalPercent = Math.max(0, current - prev);
  return (totalFunding * incrementalPercent) / 100;
};

// Handle klik peta
const LocationPicker = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect(lat, lng);
    },
  });
  return null;
};

// Move map saat posisi berubah
const MapMover = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 16);
  }, [position]);
  return null;
};

const TambahProyek = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { data: developers, isLoading } = useDeveloperDropdown();
  const [logicDisbursements, setLogicDisbursements] = useState([]);
  const [filteredStages, setFilteredStages] = useState([]);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  // Load logic disbursement
  useEffect(() => {
    getAllLogicDisbursement().then((res) => {
      setLogicDisbursements(res.data || []);
    });
  }, []);

  const handleDeveloperChange = (developerId) => {
    const selectedDev = developers?.data?.find((d) => d.id === developerId);
    if (!selectedDev) return;
    const { developerTier } = selectedDev;
    const stages = logicDisbursements
      .filter((item) => item.developerType === developerTier)
      .sort((a, b) => a.cumulativePercentage - b.cumulativePercentage);
    setFilteredStages(stages);
  };

  const totalFunding = Form.useWatch("totalFunding", form);

  // === 🗺️ Klik peta → update koordinat & nama lokasi
  const handleMapClick = async (lat, lng) => {
    form.setFieldsValue({
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    });
    setMarkerPosition([lat, lng]);

    // Reverse geocode
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data?.display_name) {
        setSearchQuery(data.display_name);
      }
    } catch {
      /* ignore */
    }
  };

  // === ✏️ Ubah lat/lng manual → marker pindah
  const handleLatLngChange = () => {
    const lat = parseFloat(form.getFieldValue("latitude"));
    const lng = parseFloat(form.getFieldValue("longitude"));
    if (!isNaN(lat) && !isNaN(lng)) {
      setMarkerPosition([lat, lng]);
    }
  };

  // === 🔍 Cari lokasi → pindah marker + isi lat/lng
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        setMarkerPosition([latNum, lonNum]);
        form.setFieldsValue({
          latitude: latNum.toFixed(6),
          longitude: lonNum.toFixed(6),
        });
        setSearchQuery(display_name);
        message.success("Lokasi ditemukan!");
      } else {
        message.warning("Lokasi tidak ditemukan!");
      }
    } catch (error) {
      console.error(error);
      message.error("Gagal mencari lokasi!");
    } finally {
      setSearchLoading(false);
    }
  };

  // === 💾 Simpan data proyek
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const disbursementTerms = filteredStages.map((stage, idx, arr) => {
        const incrementalValue = getTermDisbursementValue(
          stage,
          idx,
          arr,
          values.totalFunding || totalFunding
        );
        return {
          progressStage: stage.progressStage,
          physicalPercentage: stage.cumulativePercentage,
          disbursementValue: incrementalValue,
        };
      });

      const payload = {
        projectName: values.projectName,
        clientName: values.clientName,
        developerId: values.developerId,
        latitude: values.latitude,
        longitude: values.longitude,
        completionSchedule: values.completionSchedule.format("YYYY-MM-DD"),
        startDate: values.startDate.format("YYYY-MM-DD"),
        sprNumber: values.sprNumber,
        totalFunding: values.totalFunding,
        disbursementTerms,
      };

      await createProject(payload);
      message.success("Proyek berhasil ditambahkan!");
      navigate("/project"); // kembali ke daftar proyek
    } catch (err) {
      console.error(err);
      message.error("Gagal menambahkan proyek!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Tahapan", dataIndex: "progressStage" },
    {
      title: "Persentase",
      dataIndex: "cumulativePercentage",
      render: (val) => `${val}%`,
    },
    { title: "Keterangan", dataIndex: "notes" },
    {
      title: "Nilai Pencairan (Rp)",
      render: (_, record, index) => {
        const val = getTermDisbursementValue(record, index, filteredStages, totalFunding);
        return totalFunding ? `Rp ${Number(val).toLocaleString("id-ID")}` : "-";
      },
    },
  ];
  return (
    <MainLayout pageTitle="Tambah Proyek">
      <div className="Proyek-container">
        <Title level={3}>Tambah Proyek Baru</Title>
        <Form layout="vertical" form={form}>
          <Form.Item name="projectName" label="Nama Proyek" rules={[{ required: true }]}>
            <Input placeholder="Masukkan nama proyek" />
          </Form.Item>

          <Form.Item name="clientName" label="Nama Nasabah" rules={[{ required: true }]}>
            <Input placeholder="Masukkan nama nasabah" />
          </Form.Item>

          <Form.Item name="developerId" label="Developer" rules={[{ required: true }]}>
            {isLoading ? (
              <Spin />
            ) : (
              <Select placeholder="Pilih developer" onChange={handleDeveloperChange}>
                {developers?.data?.map((dev) => (
                  <Option key={dev.id} value={dev.id}>
                    {dev.companyName} ({dev.developerTier})
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>

          {/* Lokasi Interaktif */}
          <Form.Item label="Lokasi Proyek" required>
            <Space.Compact block style={{ marginBottom: 8 }}>
              <Input
                placeholder="Cari lokasi (contoh: Perumahan Majasari Bandung)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={handleSearchLocation}
              />
              <Button loading={searchLoading} type="primary" onClick={handleSearchLocation}>
                Cari
              </Button>
            </Space.Compact>

            <div style={{ height: "300px", borderRadius: "8px", overflow: "hidden" }}>
              <MapContainer
                center={markerPosition || [-6.2, 106.8]}
                zoom={markerPosition ? 15 : 10}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker onSelect={handleMapClick} />
                {markerPosition && <Marker position={markerPosition} />}
                <MapMover position={markerPosition} />
              </MapContainer>
            </div>

            <Space.Compact block style={{ marginTop: 8 }}>
              <Form.Item
                name="latitude"
                noStyle
                rules={[{ required: true, message: "Latitude wajib diisi" }]}
              >
                <Input placeholder="Latitude" style={{ width: "50%" }} onBlur={handleLatLngChange} />
              </Form.Item>
              <Form.Item
                name="longitude"
                noStyle
                rules={[{ required: true, message: "Longitude wajib diisi" }]}
              >
                <Input
                  placeholder="Longitude"
                  style={{ width: "50%" }}
                  onBlur={handleLatLngChange}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item name="startDate" label="Tanggal Awal Akad" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="completionSchedule" label="Jadwal Selesai" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="sprNumber" label="Nomor SPR" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="totalFunding" label="Total Pendanaan" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: "100%" }}
              formatter={(v) => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              parser={(v) => v.replace(/\Rp\s?|(\.)/g, "")}
            />
          </Form.Item>

          {filteredStages.length > 0 && (
            <>
              <Divider />
              <Title level={5}>Termin Pencairan</Title>
              <Table
                dataSource={filteredStages}
                columns={columns}
                pagination={false}
                rowKey="id"
                size="small"
              />
            </>
          )}

          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button onClick={() => navigate("/proyek")} style={{ marginRight: 8 }}>
              Batal
            </Button>
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              Simpan
            </Button>
          </div>
        </Form>
      </div>
    </MainLayout>
  );
};

export default TambahProyek;
