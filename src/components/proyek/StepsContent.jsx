import React from "react";
import { Form, Input, Card, Typography } from "antd";

const { Title } = Typography;

const StepContent = ({ currentStep, steps }) => {
  const step = steps[currentStep];

  if (!step) return null;

  return (
    <Card
      title={<Title level={4}>{step.title}</Title>}
      style={{ borderRadius: 12 }}
    >
      {step.form ? (
        <step.form />
      ) : (
        <Form layout="vertical">
          <Form.Item label="Catatan">
            <Input.TextArea rows={4} placeholder="Masukkan catatan..." />
          </Form.Item>
        </Form>
      )}
    </Card>
  );
};

export default StepContent;
