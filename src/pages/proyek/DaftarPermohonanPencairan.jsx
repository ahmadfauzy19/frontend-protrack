
import MainLayout from "../../layouts/MainLayout"
import { Table, Button, message } from "antd"; // Import message dari antd
import React from "react";
import '../../assets/css/Developer.css';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined, DownloadOutlined, ImportOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { Tooltip, Space, Popconfirm } from 'antd';
import ModalTambahProyek from "./ModalTambahProyek";
import ModalViewProyek from "./ModalViewProyek";
import ProjectData from "../../hook/ProjectData";
import { updateProject } from "../../service/api/ProjectApi";
import { AuthContext } from "../../contexts/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";



const DaftarPermohonanPencairan = () => {
    const [modalTambahVisible, setModalTambahVisible] = React.useState(false);
    const [projectToEdit, setProjectToEdit] = React.useState(null);
    const [modalViewVisible, setModalViewVisible] = React.useState(false);
    const [projectToView, setProjectToView] = React.useState(null);
    const { user } = React.useContext(AuthContext);
    const isReviewer = user.roles.includes("REVIEWER");
    const isEmployee = user.roles[0].authority.includes("EMPLOYEE");
    // di dalam komponen tabel
    const navigate = useNavigate();

    const {
        projectRequest,
        loading,
        paginationRequest,
        fetchProjectsRequest,
    } = ProjectData({});

    React.useEffect(() => {
        fetchProjectsRequest(paginationRequest.current, paginationRequest.pageSize);
      }, [paginationRequest.current, paginationRequest.pageSize]);


      // Handler dummy sementara
    const handleView = (record) => {
      navigate(`/project-request/${record.id}`);
    };


    // Hapus dataSource dummy, karena sudah menggunakan projectList dari hook

    const columns = [
      {
        title: "No",
        key: "no",
        width: 60,
        align: "center",
        render: (_text, _record, index) =>
          (paginationRequest.current - 1) * paginationRequest.pageSize + index + 1,
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
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: "#35A6F9" }}
              >
                Lihat
              </span>
            </div>
          </div>
        ),
      },
    ];

    return (
        <>
            <MainLayout pageTitle="Daftar Permohonan Pencairan">
                <div className="Proyek-container">
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                    }}>
                        <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 'bold', fontSize: '24px', color: '#101455' }}>Daftar Proyek</h2> 
                </div>
                    {/* Table data proyek */}
                    <Table
                      dataSource={projectRequest}
                      columns={columns}
                      loading={loading}
                      pagination={{
                          current: paginationRequest.current,
                          pageSize: paginationRequest.pageSize,
                          total: paginationRequest.total,
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
            </MainLayout>
        </>
    )
}

export default DaftarPermohonanPencairan;