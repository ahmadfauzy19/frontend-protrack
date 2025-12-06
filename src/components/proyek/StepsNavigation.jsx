import React from "react";
import { Steps } from "antd";

const StepsNavigation = ({ steps, current, onChange }) => {
  return (
    <Steps
      current={current}
      onChange={onChange}
      items={steps.map((step) => ({
        title: step.title,
        status: step.status,
      }))}
      responsive
      style={{
        maxWidth: 1000,
        margin: "0 auto 24px",
      }}
    />
  );
};

export default StepsNavigation;
