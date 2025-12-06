import React from "react";
import { Form, Input, Collapse } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

const ProjectInfo = ({ project }) => {
  const { projectName, clientName, developer, tierDeveloper, completionSchedule, latitude, longitude } =
    project || {};

  return (
    <Collapse
      bordered
      defaultActiveKey={["1"]}
      items={[
        {
          key: "1",
          label: <div style={{ color: "white", fontWeight: 600 }}>Informasi Proyek</div>,
          style: {
            backgroundColor: "#0A67E0",
            borderRadius: 12,
          },
          children: (
            <Form layout="vertical" style={{ marginTop: 20 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <Form.Item label="Nama Proyek">
                  <Input value={projectName || "-"} readOnly />
                </Form.Item>

                <Form.Item label="Nama Klien">
                  <Input value={clientName || "-"} readOnly />
                </Form.Item>

                <Form.Item label="Developer">
                  <Input value={developer?.companyName || "-"} readOnly />
                </Form.Item>

                <Form.Item label="Tier Developer">
                  <Input value={tierDeveloper || "-"} readOnly />
                </Form.Item>

                <Form.Item label="Jadwal Penyelesaian">
                  <Input value={completionSchedule || "-"} readOnly />
                </Form.Item>

                <Form.Item label="Koordinat Lokasi">
                  <Input
                    prefix={<EnvironmentOutlined />}
                    value={`${latitude || "-"}, ${longitude || "-"}`}
                    readOnly
                  />
                </Form.Item>
              </div>
            </Form>
          ),
        },
      ]}
    />
  );
};

export default ProjectInfo;
