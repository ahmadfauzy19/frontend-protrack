import { Descriptions, Table, Typography, Divider, Spin, Button, Card, Row, Col, message, Image } from "antd";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { putStatusDocument, getProjectsById } from "../../service/api/ProjectApi";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

// Fix marker icon default
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LihatPermohonanPencairan = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [reverseLocation, setReverseLocation] = useState(null);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [locallyUnDeclined, setLocallyUnDeclined] = useState({});

  const handleLocalCancel = (docId) => {
    setLocallyUnDeclined((p) => ({ ...p, [docId]: true }));
  };

  // 🔁 Ambil data proyek dari backend
  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await getProjectsById(projectId);
      if (response?.data) {
        const projectData = response.data;
        setProject(projectData);

        // Inisialisasi dokumen per termin
        const initialDocs = {};
        projectData.disbursementTerms?.forEach((term) => {
          initialDocs[term.id] = term.progressDocuments || [];
        });
        setDocuments(initialDocs);
      }
    } catch (error) {
      console.error("Gagal mengambil data proyek:", error);
      message.error("Gagal memuat data proyek");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Update status dokumen dan refresh data
  // ...existing code...
  const handleApproveReject = async (termId, docId, status) => {
    try {
      // Optimis: update UI segera agar terlihat responsif
      setDocuments((prevDocs) => {
        const prevList = prevDocs?.[termId] || [];
        const updatedTermDocs = prevList.map((doc) =>
          doc.id === docId ? { ...doc, status } : doc
        );
        return { ...prevDocs, [termId]: updatedTermDocs };
      });

      setProject((prevProject) => {
        if (!prevProject) return prevProject;
        const updatedTerms = (prevProject.disbursementTerms || []).map((term) => {
          if (term.id === termId) {
            const updatedDocs = (term.progressDocuments || []).map((doc) =>
              doc.id === docId ? { ...doc, status } : doc
            );
            return { ...term, progressDocuments: updatedDocs };
          }
          return term;
        });
        return { ...prevProject, disbursementTerms: updatedTerms };
      });

      // Clear any local "cancel decline" flag when action performed
      setLocallyUnDeclined((prev) => {
        const copy = { ...prev };
        if (copy[docId]) delete copy[docId];
        return copy;
      });

      // Panggil API (tetap jalankan, error akan ditangani)
      await putStatusDocument(docId, status);

      message.success(status === "VERIFIED" ? "Dokumen disetujui" : "Dokumen ditolak");
    } catch (error) {
      console.error("Gagal update status dokumen:", error);
      message.error("Gagal mengubah status dokumen");

      // Rollback sederhana: re-fetch project untuk sinkronisasi jika terjadi error
      fetchProject();
    }
  };


  if (loading || !project) {
    return (
      <MainLayout pageTitle="Memuat Data Proyek...">
        <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  const disbursementColumns = [
    { title: "Tahapan", dataIndex: "progressStage" },
    {
      title: "Persentase Fisik",
      dataIndex: "physicalPercentage",
      render: (val) => `${val}%`,
    },
    {
      title: "Nilai Pencairan (Rp)",
      dataIndex: "disbursementValue",
      render: (val) => (val ? `Rp ${Number(val).toLocaleString("id-ID")}` : "-"),
    },
    {
      title: "Status",
      dataIndex: "disbursementStatus",
    },
  ];

  return (
    <MainLayout pageTitle="Daftar Permohonan Pencairan">
      <div style={{ padding: 24 }}>
        <Title level={3}>Detail Proyek: {project.projectName}</Title>

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Nama Proyek">{project.projectName}</Descriptions.Item>
          <Descriptions.Item label="Nama Nasabah">{project.clientName}</Descriptions.Item>
          <Descriptions.Item label="Developer">{project.developer?.companyName || "-"}</Descriptions.Item>
          <Descriptions.Item label="Tier Developer">{project.developer?.developerTier || "-"}</Descriptions.Item>
          <Descriptions.Item label="Nomor SPR">{project.sprNumber}</Descriptions.Item>
          <Descriptions.Item label="Jadwal Selesai">
            {project.completionSchedule ? dayjs(project.completionSchedule).format("DD MMM YYYY") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Total Pendanaan">
            Rp {Number(project.totalFunding || 0).toLocaleString("id-ID")}
          </Descriptions.Item>
          <Descriptions.Item label="Latitude">{project.latitude}</Descriptions.Item>
          <Descriptions.Item label="Longitude">{project.longitude}</Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Peta lokasi */}
        <Title level={5}>Lokasi Proyek</Title>
        <div style={{ height: 300, borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
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

        <Divider />

        {/* Termin pencairan dana */}
        <Title level={5}>Termin Pencairan Dana</Title>
        <Table
          dataSource={project.disbursementTerms}
          columns={disbursementColumns}
          pagination={false}
          rowKey={(row) => row.id}
          expandable={{
            expandedRowRender: (record) => {
              const docs = documents[record.id] || [];
              if (docs.length === 0)
                return <Text type="secondary">Belum ada dokumen progres</Text>;

              return (
                <Row gutter={[16, 16]}>
                  {docs.map((doc) => {
                    const fileName = doc.photoUrl.split("/").pop() || "";
                    const description =
                      fileName
                        .replace(/\.\w+$/, "") // hilangkan ekstensi
                        .split("_")
                        .slice(1) // buang timestamp di awal jika ada
                        .join(" ")
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase()) || "Foto Progress";

                    return (
                      <Col key={doc.id} span={8}>
                        <Card
                          cover={
                            <Image
                              src={`http://localhost:8081${doc.photoUrl}`}
                              alt="progress"
                              style={{ height: 150, objectFit: "cover" }}
                            />
                          }
                          size="small"
                          title={
                            <>
                              <div><strong>{description}</strong></div>
                              <div style={{ fontSize: 12, color: "#888" }}>
                                Upload: {dayjs(doc.uploadDate).format("DD MMM YYYY HH:mm")}
                              </div>
                            </>
                          }
                        >
                        {(() => {
                          const isLocallyCancelled = !!locallyUnDeclined[doc.id];

                          // 1) Approved (VERIFIED) and not locally cancelled
                          if (doc.status === "VERIFIED" && !isLocallyCancelled) {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <CheckCircleOutlined style={{ color: "green", fontSize: 18 }} />
                                  <Text strong style={{ color: "green" }}>
                                    Disetujui
                                  </Text>
                                </div>
                                <Button
                                  type="default"
                                  danger
                                  size="small"
                                  onClick={() => handleLocalCancel(doc.id)}
                                >
                                  Batalkan
                                </Button>
                              </div>
                            );
                          }

                          // 2) Declined: tampilkan "Ditolak" + tombol Batalkan (hanya ubah UI)
                          if (doc.status === "DECLINED" && !isLocallyCancelled) {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <CloseCircleOutlined style={{ color: "red", fontSize: 18 }} />
                                  <Text strong style={{ color: "red" }}>
                                    Ditolak
                                  </Text>
                                </div>
                                <Button
                                  type="default"
                                  size="small"
                                  onClick={() => handleLocalCancel(doc.id)}
                                >
                                  Batalkan
                                </Button>
                              </div>
                            );
                          }

                          // 3) Default / setelah Batalkan (lokal) -> tampilkan opsi Setujui / Tolak
                          return (
                            <div style={{ marginTop: 8 }}>
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => handleApproveReject(record.id, doc.id, "VERIFIED")}
                                style={{ marginRight: 8 }}
                              >
                                Setujui
                              </Button>
                              <Button
                                type="default"
                                danger
                                size="small"
                                onClick={() => handleApproveReject(record.id, doc.id, "DECLINED")}
                              >
                                Tolak
                              </Button>
                            </div>
                          );
                        })()}
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              );
            },
          }}
        />
      </div>
    </MainLayout>
  );
};

export default LihatPermohonanPencairan;
