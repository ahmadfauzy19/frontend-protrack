import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Collapse,
  Progress,
  Tag,
  Typography,
  Row,
  Col,
  Space,
  message,
  Spin,
  Divider,
  Statistic,
  Pagination,
} from "antd";
import { Table, Modal, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import {
  CheckCircleOutlined,
  WarningOutlined,
  DollarCircleOutlined,
  ProjectOutlined,
  ApartmentOutlined,
  BarChartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import MainLayout from "../layouts/MainLayout";
import {
  fetchDashboardData,
  fetchDashboardDataSummary,
} from "../service/api/DashboardApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useNavigate } from "react-router-dom";


const { Title, Text } = Typography;
const { Panel } = Collapse;

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

const COLORS = ["#d9d9d9", "#fa8c16", "#1890ff", "#52c41a", "#f5222d", "#722ed1"];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [report, setReport] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  // ==========================
  // Fetch data functions
  // ==========================
  const loadSummary = async () => {
    try {
      const response = await fetchDashboardDataSummary();
      setSummary(response);
    } catch (error) {
      console.error("Error fetching summary:", error);
      message.error("Gagal memuat summary dashboard.");
    }
  };

  const loadReport = async (page = 0, size = 10) => {
    try {
      setLoading(true);
      const response = await fetchDashboardData(page, size);
      // Backend return: { statusCode, message, data, pagination }
      setReport(response?.data || []);
      setPagination(response?.pagination || { page: 0, size: 10, totalElements: 0 });
    } catch (error) {
      console.error("Error fetching developer report:", error);
      message.error("Gagal memuat laporan developer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    loadReport();
  }, []);

  // ==========================
  // Render
  // ==========================
  if (loading) {
    return (
      <MainLayout pageTitle="Dashboard">
        <div style={{ textAlign: "center", marginTop: "20vh" }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="Dashboard">
      <div style={{ padding: "10px" }}>
        {/* ===================== 🧭 SUMMARY SECTION ===================== */}
        <Title level={3} style={{ marginBottom: 20 }}>
          🧭 Summary
        </Title>

        {summary ? (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={6}>
                <Card variant="outlined">
                  <Statistic
                    title="Total Developer"
                    value={summary.totalDevelopers}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card variant="outlined">
                  <Statistic
                    title="Total Project"
                    value={summary.totalProjects}
                    prefix={<ProjectOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card variant="outlined">
                  <Statistic
                    title="Completed Projects"
                    value={summary.completedProjects}
                    valueStyle={{ color: "#52c41a" }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card variant="outlined">
                  <Statistic
                    title="Active Projects"
                    value={summary.activeProjects}
                    valueStyle={{ color: "#1890ff" }}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
              <Col xs={24} sm={12} md={8}>
                <Card variant="outlined">
                  <Statistic
                    title="Rata-rata Progress Developer"
                    value={summary.developerPerformance?.averageProgressAll ?? 0}
                    suffix="%"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card variant="outlined">
                  <Statistic
                    title="Developer Terlambat (>2 bulan)"
                    value={summary.developerPerformance?.developersWithLateProjects ?? 0}
                    valueStyle={{ color: "#cf1322" }}
                    prefix={<WarningOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card variant="outlined">
                  <Statistic
                    title="Top Developer"
                    value={
                      summary.developerPerformance?.topPerformers?.[0]?.developerName || "-"
                    }
                    prefix={<ApartmentOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <Text type="secondary">Data summary tidak tersedia.</Text>
        )}

        {/* ===================== 📊 REPORTING DEVELOPER ===================== */}
        <Divider />
          <Title level={3} style={{ marginBottom: 20 }}>
            📊 Reporting Developer
          </Title>

          {report.length === 0 ? (
            <Text type="secondary">Tidak ada data untuk ditampilkan.</Text>
          ) : (
            <>
              <Table
                dataSource={report}
                rowKey="developerId"
                pagination={false}
                columns={[
                  {
                    title: "Developer",
                    dataIndex: "developerName",
                    key: "developerName",
                    render: (text, record) => (
                      <Space>
                        <ProjectOutlined
                          style={{ color: tierColors[record.classificationTier] }}
                        />
                        <Text strong>{text}</Text>
                      </Space>
                    ),
                  },
                  {
                    title: "Tier",
                    dataIndex: "classificationTier",
                    key: "classificationTier",
                    render: (tier) => (
                      <Tag
                        color={tierColors[tier]}
                        style={{ borderRadius: 6, fontWeight: 600 }}
                      >
                        {tier}
                      </Tag>
                    ),
                  },
                  {
                    title: "Total Project",
                    key: "totalProjects",
                    render: (_, record) => record.projects?.length || 0,
                    align: "center",
                  },
                  {
                    title: "Avg Progress",
                    dataIndex: "avgProgress",
                    key: "avgProgress",
                    align: "center",
                    render: (val) => `${Number(val || 0).toFixed(1)}%`,
                  },
                  {
                    title: "Late Projects",
                    dataIndex: "lateProjects",
                    key: "lateProjects",
                    align: "center",
                    render: (val) =>
                      val > 0 ? (
                        <Tag color="red">{val}</Tag>
                      ) : (
                        <Tag color="green">0</Tag>
                      ),
                  },
                  {
                    title: "Action",
                    key: "action",
                    align: "center",
                    render: (_, record) => (
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/report-developer-detail/${record.developerId}`)}
                      >
                        Detail
                      </Button>
                    ),
                  },
                ]}
              />

              {/* Pagination */}
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <Pagination
                  current={pagination.page + 1}
                  total={pagination.totalElements}
                  pageSize={pagination.size}
                  onChange={(page, pageSize) => loadReport(page - 1, pageSize)}
                  showSizeChanger
                  showQuickJumper
                />
              </div>
            </>
          )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
