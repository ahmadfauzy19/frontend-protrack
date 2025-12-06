import {
  Modal,
  Descriptions,
  Table,
  Typography,
  Divider,
  Spin,
} from "antd";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import dayjs from "dayjs";

const { Title } = Typography;

// Fix marker icon default
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ModalViewProyek = ({ visible, setVisible, project }) => {
  const [reverseLocation, setReverseLocation] = useState(null);

  useEffect(() => {
    if (visible && project?.latitude && project?.longitude) {
      // Reverse geocode untuk tampilkan nama lokasi
      const fetchAddress = async () => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${project.latitude}&lon=${project.longitude}`
          );
          const data = await res.json();
          setReverseLocation(data?.display_name || null);
        } catch (e) {
          setReverseLocation(null);
        }
      };
      fetchAddress();
    }
  }, [visible, project]);

  if (!project) return null;

  const columns = [
    { title: "Tahapan", dataIndex: "progressStage" },
    {
      title: "Persentase Fisik",
      dataIndex: "physicalPercentage",
      render: (val) => `${val}%`,
    },
    {
      title: "Nilai Pencairan (Rp)",
      dataIndex: "disbursementValue",
      render: (val) =>
        val ? `Rp ${Number(val).toLocaleString("id-ID")}` : "-",
    },
  ];

  return (
    <Modal
      title={`Detail Proyek: ${project.projectName || "-"}`}
      open={visible}
      onCancel={() => setVisible(false)}
      footer={null}
      centered
      width={750}
      style={{ maxHeight: "90vh", overflowY: "auto" }}
    >
      <Spin spinning={!project}>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Nama Proyek">
            {project.projectName}
          </Descriptions.Item>
          <Descriptions.Item label="Nama Nasabah">
            {project.clientName}
          </Descriptions.Item>
          <Descriptions.Item label="Developer">
            {project.developer.companyName || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Tier Developer">
            {project.developer.developerTier || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Nomor SPR">
            {project.sprNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Jadwal Selesai">
            {project.completionSchedule
              ? dayjs(project.completionSchedule).format("DD MMM YYYY")
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Total Pendanaan">
            Rp {Number(project.totalFunding || 0).toLocaleString("id-ID")}
          </Descriptions.Item>
          <Descriptions.Item label="Latitude">
            {project.latitude}
          </Descriptions.Item>
          <Descriptions.Item label="Longitude">
            {project.longitude}
          </Descriptions.Item>
          <Descriptions.Item label="Alamat Lokasi">
            {reverseLocation || (
              <span style={{ color: "#999" }}>Memuat lokasi...</span>
            )}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* 🗺️ Peta lokasi */}
        <Title level={5}>Lokasi Proyek</Title>
        <div
          style={{
            height: "300px",
            borderRadius: "8px",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          {project.latitude && project.longitude ? (
            <MapContainer
              center={[project.latitude, project.longitude]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[project.latitude, project.longitude]} />
            </MapContainer>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888",
              }}
            >
              Lokasi tidak tersedia
            </div>
          )}
        </div>

        {/* 💰 Termin pencairan dana */}
        {project.disbursementTerms?.length > 0 && (
          <>
            <Divider />
            <Title level={5}>Termin Pencairan Dana</Title>
            <Table
              dataSource={project.disbursementTerms}
              columns={columns}
              pagination={false}
              rowKey={(row) => row.id || row.progressStage}
              size="small"
            />
          </>
        )}
      </Spin>
    </Modal>
  );
};

export default ModalViewProyek;
