import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Tag,
  Progress,
  Space,
  Row,
  Col,
  Spin,
  Divider,
  Button,
  message,
  Table,
} from "antd";
import {
  ArrowLeftOutlined,
  ProjectOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import MainLayout from "../layouts/MainLayout";
import { fetchDeveloperDashboardDetail } from "../service/api/DashboardApi";

const { Title, Text } = Typography;

const tierColors = {
  PLATINUM: "#722ed1",
  GOLD: "#faad14",
  SILVER: "#bfbfbf",
  SILVER_KYG: "#13c2c2",
  BRONZE_KYG: "#fa541c",
};

const statusColors = {
  NOT_STARTED: "#d9d9d9",
  NEED_VERIFICATION: "#fa8c16",
  READY_FOR_DISBURSEMENT: "#1890ff",
  DISBURSED: "#52c41a",
  REJECTED: "#f5222d",
  REVISED: "#722ed1",
};

const DeveloperDashboardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);

  // pagination state untuk tabel proyek
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchDeveloperDashboardDetail({developerId : id,page : pagination.current, size : pagination.pageSize});
        setDeveloper(res);
      } catch (err) {
        console.error("Error fetching developer detail:", err);
        message.error("Gagal memuat data developer.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <MainLayout pageTitle="Detail Developer">
        <div style={{ textAlign: "center", marginTop: "20vh" }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!developer) {
    return (
      <MainLayout pageTitle="Developer Tidak Ditemukan">
        <div style={{ textAlign: "center", marginTop: "20vh" }}>
          <Text type="secondary">Data developer tidak ditemukan.</Text>
        </div>
      </MainLayout>
    );
  }

  // Kolom tabel proyek
  const projectColumns = [
    {
      title: "Nama Proyek",
      dataIndex: "projectName",
      key: "projectName",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Klien: {record.clientName}
          </Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Tag color={record.isLate ? "red" : "green"}>{status}</Tag>
      ),
    },
    {
      title: "Periode",
      key: "dates",
      render: (_, record) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.startDate} → {record.completionSchedule}
        </Text>
      ),
    },
    {
      title: "Progress",
      dataIndex: "avgProgress",
      key: "avgProgress",
      render: (value, record) => (
        <Progress
          percent={Number(value) || 0}
          status={record.isLate ? "exception" : "active"}
          strokeColor={
            record.isLate ? "#ff4d4f" : { from: "#52c41a", to: "#13c2c2" }
          }
          size="small"
          format={(p) => `${Number(p || 0).toFixed(1)}%`}
        />
      ),
    },
    {
      title: "Termin Pencairan",
      dataIndex: "disbursementTerms",
      key: "disbursementTerms",
      render: (terms = []) =>
        terms.length > 0 ? (
          <Space direction="vertical" size={2}>
            {terms.map((term, idx) => (
              <Tag
                key={idx}
                color={statusColors[term.disbursementStatus]}
                style={{ marginBottom: 2 }}
              >
                {term.progressStage}: {term.physicalPercentage ?? 0}%
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Belum ada termin
          </Text>
        ),
    },
  ];

  // Data paginated
  const paginatedProjects = developer.projects.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  return (
    <MainLayout pageTitle={`Detail Developer`}>
      <div style={{ padding: "10px" }}>
        {/* Tombol Kembali */}
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 10 }}
        >
          Kembali
        </Button>

        {/* Informasi Developer */}
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            marginBottom: 20,
          }}
          title={
            <Space>
              <ProjectOutlined
                style={{ color: tierColors[developer.classificationTier] }}
              />
              <Text strong>{developer.developerName}</Text>
              <Tag
                color={tierColors[developer.classificationTier]}
                style={{ borderRadius: 6 }}
              >
                {developer.classificationTier}
              </Tag>
            </Space>
          }
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Card>
                <Text strong>Total Project</Text>
                <Title level={3}>{developer.projects.length}</Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Text strong>Rata-rata Progress</Text>
                <Title level={3}>{developer.avgProgress?.toFixed(1)}%</Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Text strong>Project Terlambat</Text>
                <Title
                  level={3}
                  type={developer.lateProjects > 0 ? "danger" : undefined}
                >
                  {developer.lateProjects}
                </Title>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Daftar Proyek */}
        <Divider />
        <Title level={4}>📋 Daftar Proyek</Title>

        <Table
          dataSource={paginatedProjects}
          columns={projectColumns}
          rowKey="projectId"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: developer.projects.length,
            showSizeChanger: false,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
          expandable={{
            expandedRowRender: (record) =>
              record.isLate ? (
                <Text type="danger">
                  <WarningOutlined /> {record.warningMessage}
                </Text>
              ) : null,
          }}
          style={{ marginTop: 16 }}
        />
      </div>
    </MainLayout>
  );
};

export default DeveloperDashboardDetail;
