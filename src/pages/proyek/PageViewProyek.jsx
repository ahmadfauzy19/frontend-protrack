import {
  Descriptions,
  Table,
  Typography,
  Divider,
  Spin,
  Button,
  Card,
  Col,
  Row,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import dayjs from "dayjs";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { getProjectsById } from "../../service/api/ProjectApi";
import MainLayout from "../../layouts/MainLayout";

const { Title } = Typography;

// 🔧 Perbaikan default icon marker leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const PageViewProyek = () => {
  const navigate = useNavigate();
  const { projectId } = useParams(); // jika ada rute /proyek/:id
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reverseLocation, setReverseLocation] = useState(null);

  // 🧩 Fetch detail proyek
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await getProjectsById(projectId);
        const data = response.data;
        setProject(data);
      } catch (error) {
        console.error("Gagal memuat proyek:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  // 🗺️ Reverse geocoding
  useEffect(() => {
    if (project?.latitude && project?.longitude) {
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
  }, [project]);

  const columns = [
    {
      title: "Tahapan",
      dataIndex: "progressStage",
      key: "progressStage",
    },
    {
      title: "Persentase Fisik",
      dataIndex: "physicalPercentage",
      key: "physicalPercentage",
      render: (val) => (val ? `${val}%` : "-"),
    },
    {
      title: "Nilai Pencairan (Rp)",
      dataIndex: "disbursementValue",
      key: "disbursementValue",
      render: (val) =>
        val ? `Rp ${Number(val).toLocaleString("id-ID")}` : "-",
    },
    {
      title: "Tanggal Pengajuan",
      dataIndex: "submissionDate",
      key: "submissionDate",
      render: (val) => (val ? dayjs(val).format("DD MMM YYYY") : "-"),
    },
    {
      title: "Status",
      dataIndex: "disbursementStatus",
      key: "disbursementStatus",
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin tip="Memuat detail proyek..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: 24 }}>
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
          Kembali
        </Button>
        <Divider />
        <Typography.Text>Tidak ada data proyek ditemukan.</Typography.Text>
      </div>
    );
  }

  return (
    <MainLayout title="Detail Proyek">

      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
          <Button
            onClick={() => navigate(-1)}
            icon={<ArrowLeftOutlined />}
            style={{ marginRight: 8 }}
          >
            Kembali
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            Detail Proyek: {project.projectName || "-"}
          </Title>
        </div>

        <Card bordered>
          <Spin spinning={loading}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Nama Proyek">
                {project.projectName}
              </Descriptions.Item>
              <Descriptions.Item label="Nama Nasabah">
                {project.clientName}
              </Descriptions.Item>
              <Descriptions.Item label="Developer">
                {project.developer?.companyName || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tier Developer">
                {project.developer?.developerTier || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Nomor SPR">
                {project.sprNumber || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Jadwal Selesai">
                {project.completionSchedule
                  ? dayjs(project.completionSchedule).format("DD MMM YYYY")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Total Pendanaan">
                Rp {Number(project.totalFunding || 0).toLocaleString("id-ID")}
              </Descriptions.Item>
              <Descriptions.Item label="Status Pembangunan">
                {project.constructionStatus || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Latitude">
                {project.latitude || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Longitude">
                {project.longitude || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Alamat Lokasi">
                {reverseLocation ? (
                  <>
                    <EnvironmentOutlined /> {reverseLocation}
                  </>
                ) : (
                  <span style={{ color: "#999" }}>Memuat lokasi...</span>
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* 🗺️ Peta lokasi proyek */}
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
                  expandable={{
                    expandedRowRender: (record) => {
                      const docs = record.progressDocuments || [];

                      if (!docs.length)
                        return (
                          <Typography.Text type="secondary">
                            Belum ada foto progres untuk termin ini.
                          </Typography.Text>
                        );

                      return (
                        <Row gutter={[16, 16]}>
                          {docs.map((doc) => {
                            // Ambil deskripsi dari nama file (contoh: "Tampak_Depan")
                            const fileName = doc.photoUrl.split("/").pop() || "";
                            const description =
                              fileName
                                .replace(/\.\w+$/, "") // hilangkan ekstensi
                                .split("_")
                                .slice(1) // buang timestamp di awal
                                .join(" ")
                                .replace(/-/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase()) || "Foto Progress";

                            return (
                              <Col key={doc.id} span={8}>
                                <Card
                                  hoverable
                                  cover={
                                    <img
                                      src={`http://localhost:8081${doc.photoUrl}`}
                                      alt={description}
                                      style={{
                                        borderRadius: 8,
                                        height: 150,
                                        objectFit: "cover",
                                      }}
                                    />
                                  }
                                  size="small"
                                  title={description}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    {doc.validationStatus ? (
                                      <span
                                        style={{
                                          color: "green",
                                          fontWeight: 500,
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 6,
                                        }}
                                      >
                                        <span
                                          style={{
                                            display: "inline-flex",
                                            width: 18,
                                            height: 18,
                                            borderRadius: "50%",
                                            border: "2px solid green",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 12,
                                          }}
                                        >
                                          ✓
                                        </span>
                                        Verified
                                      </span>
                                    ) : (
                                      <span
                                        style={{
                                          color: "#999",
                                          fontWeight: 500,
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 6,
                                        }}
                                      >
                                        <span
                                          style={{
                                            display: "inline-flex",
                                            width: 18,
                                            height: 18,
                                            borderRadius: "50%",
                                            border: "2px solid #999",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 12,
                                          }}
                                        >
                                          ✗
                                        </span>
                                        Not Verified
                                      </span>
                                    )}
                                  </div>
                                </Card>
                              </Col>
                            );
                          })}
                        </Row>
                      );
                    },
                  }}
                />
              </>
            )}
          </Spin>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PageViewProyek;
