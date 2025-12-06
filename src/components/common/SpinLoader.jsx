import React from "react";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const SpinLoader = ({ tip = "Memuat data..." }) => (
  <Spin
    fullscreen
    indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
    tip={tip}
  />
);

export default SpinLoader;