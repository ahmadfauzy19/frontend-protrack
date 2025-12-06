import MainLayout from "../../layouts/MainLayout"
import { Table, Button, message, Tooltip, Space, Popconfirm } from "antd";
import React from "react";
import '../../assets/css/Developer.css';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  DownloadOutlined,
  ImportOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import ModalTambahProyek from "./ModalTambahProyek";
import ProjectData from "../../hook/ProjectData";
import { AuthContext } from "../../contexts/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";

// Fungsi utama menentukan status pencairan proyek
const getLatestDisbursementStatus = (disbursementTerms = []) => {
  if (!disbursementTerms || disbursementTerms.length === 0) return "-";

  const disbursementOrder = ["NOT_STARTED", "STARTED", "FOUNDATION", "ROOFING", "FINISHING"];
  const sortedTerms = [...disbursementTerms].sort(
    (a, b) =>
      disbursementOrder.indexOf(a.progressStage.toUpperCase()) -
      disbursementOrder.indexOf(b.progressStage.toUpperCase())
  );

  const stageLabels = {
    NOT_STARTED: "Belum Dimulai",
    STARTED: "Awal Pekerjaan",
    FOUNDATION: "Pondasi",
    ROOFING: "Atap",
    FINISHING: "Finishing",
  };

  const statusLabelMap = {
    NOT_STARTED: "Belum Dimulai",
    NEED_VERIFICATION: "Butuh Verifikasi",
    READY_FOR_DISBURSEMENT: "Siap Dicairkan",
    DISBURSED: "Telah Dibayarkan",
    REJECTED: "Ditolak",
    REVISED: "Perlu Revisi",
  };

  // Ambil tahap terakhir yang statusnya bukan "Not Started"
  const currentTerm = [...sortedTerms]
    .reverse()
    .find((term) => term.disbursementStatus !== "Not Started");

  if (!currentTerm) {
    const first = sortedTerms[0];
    return `${statusLabelMap["NOT_STARTED"]} (${stageLabels[first.progressStage.toUpperCase()]})`;
  }

  const statusKey = currentTerm.disbursementStatus
    .replaceAll(" ", "_")
    .toUpperCase();

  return `${statusLabelMap[statusKey] || currentTerm.disbursementStatus} (${stageLabels[currentTerm.progressStage.toUpperCase()]})`;
};


const Proyek = () => {
  const [modalTambahVisible, setModalTambahVisible] = React.useState(false);
  const { user } = React.useContext(AuthContext);
  const isReviewer = user.roles.includes("REVIEWER");
  const isEmployee = user.roles[0].authority.includes("EMPLOYEE");
  const navigate = useNavigate();

  const {
    projectList,
    loading,
    pagination,
    fetchProjects,
    handleDelete,
  } = ProjectData({});

  const handleEdit = (record) => {
    navigate(`/proyek/edit/${record.id}`);
  };

  const handleView = (record) => {
    navigate(`/proyek/view/${record.id}`);
    
  };

  const handleRequestDisbursement = (projectId) => {
    navigate(`/permohonan-pencairan/${projectId}`);
  };

  const columns = [
    {
      title: "No",
      key: "no",
      width: 60,
      align: "center",
      render: (_text, _record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Nama Proyek",
      dataIndex: "projectName",
      key: "projectName",
      align: "center",
    },
    {
      title: "Nama Client",
      dataIndex: "clientName",
      key: "clientName",
      align: "center",
    },
    {
      title: "Developer",
      dataIndex: ["developer", "companyName"],
      key: "developer",
      align: "center",
      render: (text) => text || "-",
    },
    {
      title: "Lokasi (Lat, Lng)",
      key: "location",
      align: "center",
      render: (record) =>
        `${record.latitude || "-"}, ${record.longitude || "-"}`,
    },
    {
      title: "Status",
      dataIndex: "projectStatus",
      key: "projectStatus",
      align: "center",
    },
    {
      title: "Progress Terakhir",
      dataIndex: "lastProgress",
      key: "lastProgress",
      align: "center",
    },
    {
      title: "Status Pencairan",
      key: "disbursementStatus",
      align: "center",
      render: (record) => getLatestDisbursementStatus(record.disbursementTerms),
    },
    {
      title: "Aksi",
      key: "action",
      width: 200,
      align: "center",
      render: (_, record) => (
        <div className="action-icons">
          <div className="icon-wrapper">
            <Tooltip title="Lihat">
              <EyeOutlined
                style={{ color: "#35A6F9" }}
                onClick={() => handleView(record)}
              />
            </Tooltip>
            <span
              className="icon-label"
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                color: "#35A6F9",
              }}
            >
              Lihat
            </span>
          </div>

          <div className="icon-wrapper">
            <Tooltip title="Edit">
              <EditOutlined
                style={{ color: "#f9e235ff" }}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            <span
              className="icon-label"
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                color: "#f9e235ff",
              }}
            >
              Edit
            </span>
          </div>

          <div className="icon-wrapper">
            <Popconfirm
              title="Hapus proyek ini?"
              onConfirm={() => handleDelete(record.id)}
              okText="Ya"
              cancelText="Tidak"
            >
              <Tooltip title="Hapus">
                <DeleteOutlined style={{ color: "#FF6E6F" }} />
              </Tooltip>
            </Popconfirm>
            <span
              className="icon-label"
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                color: "#FF6E6F",
              }}
            >
              Hapus
            </span>
          </div>

          {isEmployee && (
            <div className="icon-wrapper">
              <Tooltip title="Ajukan Pencairan">
                <DollarCircleOutlined
                  style={{ color: "#52C41A" }}
                  onClick={() => handleRequestDisbursement(record.id)}
                />
              </Tooltip>
              <span
                className="icon-label"
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  color: "#52C41A",
                }}
              >
                Ajukan
              </span>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <MainLayout pageTitle="Proyek">
        <div className="Proyek-container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: "bold",
                fontSize: "24px",
                color: "#101455",
              }}
            >
              Daftar Proyek
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                className="icon-btn-wrapper"
                onClick={() => navigate("/project-add")}
              >
                <div className="icon-btn">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ marginRight: 8, borderRadius: "50px" }}
                  />
                  <span className="btn-text">Tambah Proyek</span>
                </div>
              </div>
              <div className="icon-btn-wrapper">
                <div className="icon-btn">
                  <Button
                    type="primary"
                    icon={<ImportOutlined />}
                    style={{ marginRight: 8, borderRadius: "50px" }}
                  />
                  <span className="btn-text">Impor Proyek</span>
                </div>
              </div>
              <div className="icon-btn-wrapper">
                <div className="icon-btn">
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    style={{ marginRight: 8, borderRadius: "50px" }}
                  />
                  <span className="btn-text">Download Template</span>
                </div>
              </div>
            </div>
          </div>

          <Table
            dataSource={projectList}
            columns={columns}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} data`,
              onChange: (page, size) => {
                fetchProjects(page, size);
              },
            }}
            rowKey="id"
            scroll={{ y: 500 }}
          />
        </div>

        {/* <ModalTambahProyek
          visible={modalTambahVisible}
          title="Tambah Proyek"
          setVisible={setModalTambahVisible}
          onSuccess={() =>
            fetchProjects(pagination.current, pagination.pageSize)
          }
        /> */}
      </MainLayout>
    </>
  );
};

export default Proyek;