import {
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  InputNumber,
  message,
  Typography,
  Divider,
  Table,
  Spin,
  AutoComplete,
  Button,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { getAllLogicDisbursement } from "../../service/api/DeveloperApi";
import { useDeveloperDropdown } from "../../hook/UseDeveloperDropdown";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { updateProject, getProjectsById } from "../../service/api/ProjectApi";
import "leaflet/dist/leaflet.css";
import "../../assets/css/Developer.css";

const { Option } = Select;
const { Title } = Typography;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationPicker = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapMover = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 16);
  }, [position]);
  return null;
};

const STATUS_OPTIONS = [
  "Not Started",
  "Need Verification",
  "Ready for Disbursement",
  "Disbursed",
  "Rejected",
  "Revised",
];

const PageEditProyek = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const { data: developers, isLoading: isDevLoading } = useDeveloperDropdown();
  const [logicDisbursements, setLogicDisbursements] = useState([]);
  const [filteredStages, setFilteredStages] = useState([]); // hasil dari logic disbursement
  const [markerPosition, setMarkerPosition] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [searchOptions, setSearchOptions] = useState([]);
  const [tierDeveloper, setTierDeveloper] = useState("");

  useEffect(() => {
    getAllLogicDisbursement().then((res) => {
      setLogicDisbursements(res.data || []);
    });
  }, []);

  // Ambil data proyek berdasarkan ID
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await getProjectsById(projectId);
        const data = res.data;

        form.setFieldsValue({
          projectName: data.projectName,
          developerId: data.developer?.id,
          latitude: data.latitude,
          longitude: data.longitude,
          completionSchedule: data.completionSchedule ? dayjs(data.completionSchedule) : null,
          projectStatus: data.projectStatus,
          sprNumber: data.sprNumber,
          totalFunding: data.totalFunding,
          locationName: data.locationName || "",
        });

        setMarkerPosition([data.latitude, data.longitude]);
        setLocationName(data.locationName || "");
        setTierDeveloper(data.developer?.developerTier || "-");

        // ✅ Load disbursement term dari data proyek, bukan dari logicDisbursement
        if (data.disbursementTerms) {
          setFilteredStages(
            data.disbursementTerms.map((t, idx) => ({
              key: idx,
              progressStage: t.progressStage,
              cumulativePercentage: t.physicalPercentage,
              disbursementStatus: t.disbursementStatus,
              notes: t.notes || "",
            }))
          );
        }
      } catch (err) {
        message.error("Gagal memuat data proyek.");
      }
    };
    fetchProject();
  }, [projectId, form]);

  // 📌 Tidak mengubah disbursementTerm lagi ketika developer diubah
  const handleDeveloperChange = (developerId) => {
    const selectedDev = developers?.data?.find((d) => d.id === developerId);
    if (selectedDev) {
      setTierDeveloper(selectedDev.developerTier || "-");
    }
  };

  const totalFunding = Form.useWatch("totalFunding", form);
  const getCalculatedValue = (percentage) =>
    totalFunding ? (totalFunding * percentage) / 100 : 0;

  const handleMapClick = (lat, lng) => {
    form.setFieldsValue({ latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
    setMarkerPosition([lat, lng]);
    fetchLocationName(lat, lng);
  };

  const handleLatLngChange = () => {
    const lat = parseFloat(form.getFieldValue("latitude"));
    const lng = parseFloat(form.getFieldValue("longitude"));
    if (!isNaN(lat) && !isNaN(lng)) {
      setMarkerPosition([lat, lng]);
      fetchLocationName(lat, lng);
    }
  };

  const fetchLocationName = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setLocationName(data.display_name || "");
      form.setFieldsValue({ locationName: data.display_name || "" });
    } catch (err) {
      console.error("Geocoding error:", err);
    }
  };

  const handleSearchLocation = async (value) => {
    if (!value) return setSearchOptions([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      setSearchOptions(
        data.map((item) => ({
          label: item.display_name,
          value: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };
  // Ubah status disbursement per baris
  const handleStatusChange = (index, newStatus) => {
    const updated = [...filteredStages];
    updated[index].disbursementStatus = newStatus;
    setFilteredStages(updated);
  };

  const handleSelectLocation = (value, option) => {
    setMarkerPosition([option.lat, option.lon]);
    form.setFieldsValue({ latitude: option.lat.toFixed(6), longitude: option.lon.toFixed(6) });
    setLocationName(option.label);
    form.setFieldsValue({ locationName: option.label });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Gunakan data disbursementTerm yang sudah ada (tidak diubah)
      const disbursementTerms = filteredStages.map((stage) => ({
        progressStage: stage.progressStage,
        physicalPercentage: stage.cumulativePercentage,
        disbursementValue: getCalculatedValue(stage.cumulativePercentage),
        disbursementStatus: stage.disbursementStatus || disbursementTerms.disbursementStatus,
        notes: stage.notes || "",
      }));

      const payload = {
        projectName: values.projectName,
        developerId: values.developerId,
        latitude: values.latitude,
        longitude: values.longitude,
        locationName: values.locationName,
        completionSchedule: values.completionSchedule
          ? values.completionSchedule.format("YYYY-MM-DD")
          : null,
        projectStatus: values.projectStatus,
        sprNumber: values.sprNumber,
        totalFunding: values.totalFunding,
        disbursementTerms, // tetap dari proyek lama
      };

      await updateProject(projectId, payload);
      message.success("Proyek berhasil diperbarui!");
      navigate("/project");
      
    } catch (err) {
      console.error(err);
      message.error("Gagal menyimpan proyek!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Tahapan", dataIndex: "progressStage" },
    { title: "Persentase", dataIndex: "cumulativePercentage", render: (val) => `${val}%` },
    { title: "Keterangan", dataIndex: "notes" },
    {
      title: "Nilai Pencairan (Rp)",
      render: (_, record) => {
        const val = getCalculatedValue(record.cumulativePercentage);
        return totalFunding ? `Rp ${val.toLocaleString("id-ID")}` : "-";
      },
    },
    {
      title: "Status",
      dataIndex: "disbursementStatus",
      render: (value, _, index) => (
        <Select
          value={value || "Not Started"}
          onChange={(v) => handleStatusChange(index, v)}
          style={{ width: "100%" }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <Option key={opt} value={opt}>
              {opt.replaceAll("_", " ")}
            </Option>
          ))}
        </Select>
      ),
    },
  ];

  return (
    <MainLayout pageTitle="Edit Proyek">
      <div className="form-container">
        <Title level={3}>Edit Data Proyek</Title>

        <Form layout="vertical" form={form}>
          <Form.Item name="projectName" label="Nama Proyek" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="developerId" label="Developer" rules={[{ required: true }]}>
            {isDevLoading ? (
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

          {/* 🧱 Tier Developer (read-only) */}
          <Form.Item label="Tier Developer">
            <Input value={tierDeveloper} disabled />
          </Form.Item>

          <Form.Item name="locationName" label="Cari Lokasi / Nama Tempat">
            <AutoComplete
              options={searchOptions}
              onSearch={handleSearchLocation}
              onSelect={handleSelectLocation}
              value={locationName}
              onChange={setLocationName}
              placeholder="Ketik nama lokasi"
            />
          </Form.Item>

          <div style={{ height: 300, borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
            <MapContainer
              center={markerPosition || [-6.2, 106.8]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              />
              <LocationPicker onSelect={handleMapClick} />
              {markerPosition && <Marker position={markerPosition} />}
              <MapMover position={markerPosition} />
            </MapContainer>
          </div>

          <Form.Item label="Koordinat Lokasi" required style={{ marginBottom: 0 }}>
            <Space.Compact block>
              <Form.Item name="latitude" noStyle rules={[{ required: true }]}>
                <Input placeholder="Latitude" onBlur={handleLatLngChange} />
              </Form.Item>
              <Form.Item name="longitude" noStyle rules={[{ required: true }]}>
                <Input placeholder="Longitude" onBlur={handleLatLngChange} />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item name="completionSchedule" label="Jadwal Selesai" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item name="sprNumber" label="Nomor SPR" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="totalFunding" label="Total Pendanaan" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(v) => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              parser={(v) => v.replace(/\Rp\s?|(\.)/g, "")}
            />
          </Form.Item>

          {filteredStages.length > 0 && (
            <>
              <Divider />
              <Title level={5}>Termin Pencairan Dana</Title>
              <Table
                dataSource={filteredStages}
                columns={columns}
                pagination={false}
                rowKey="key"
                size="small"
              />
            </>
          )}

          <Space style={{ marginTop: 20 }}>
            <Button onClick={() => navigate("/project")}>Batal</Button>
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              Simpan Perubahan
            </Button>
          </Space>
        </Form>
      </div>
    </MainLayout>
  );
};

export default PageEditProyek;
