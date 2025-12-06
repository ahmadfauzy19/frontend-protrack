import { useEffect, useState } from "react";
import { Card, Table, Tag, Statistic, Row, Col, Typography } from "antd";
import MainLayout from "../../layouts/MainLayout";

const { Title } = Typography;

const Report = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    totalDevelopers: 0,
    avgProgress: 0,
    lateDevelopers: 0,
  });

  useEffect(() => {
    // Fetch dari backend misalnya /api/report/developer
    fetch("/api/report/developer")
      .then((res) => res.json())
      .then((result) => {
        setData(result.data);
        setSummary(result.summary);
      });
  }, []);

  const columns = [
    { title: "Developer", dataIndex: "company_name", key: "company_name" },
    { title: "Tier", dataIndex: "classification_tier", key: "classification_tier" },
    { title: "Total Project", dataIndex: "total_project", key: "total_project" },
    {
      title: "Rata-rata Progress",
      dataIndex: "avg_progress",
      key: "avg_progress",
      render: (val) => `${val?.toFixed(2)}%`,
    },
    {
      title: "Total Pencairan",
      dataIndex: "total_disbursement",
      key: "total_disbursement",
      render: (val) => `Rp ${Number(val).toLocaleString("id-ID")}`,
    },
    {
      title: "Status",
      dataIndex: "status_progress",
      key: "status_progress",
      render: (status) =>
        status.includes("Terlambat") ? (
          <Tag color="red">{status}</Tag>
        ) : (
          <Tag color="green">{status}</Tag>
        ),
    },
  ];

  return (
    <MainLayout pageTitle="Reporting Developer">
      <div style={{ padding: 24 }}>
        <Title level={3}>Developer Performance Overview</Title>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic title="Total Developer" value={summary.totalDevelopers} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Rata-rata Progress Keseluruhan"
                value={summary.avgProgress}
                suffix="%"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Developer Terlambat (> 2 bulan)"
                value={summary.lateDevelopers}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Detail Per Developer">
          <Table columns={columns} dataSource={data} rowKey="developer_id" />
        </Card>
      </div>
    </MainLayout>
  );
};

export default Report;
