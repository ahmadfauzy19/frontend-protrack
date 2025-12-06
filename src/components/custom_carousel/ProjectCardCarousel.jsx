import React, { useRef } from "react";
import { Card, Flex, Typography, Space } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import "../../assets/css/CustomCarousel.css"; // Ensure this path is correct

const { Title, Text } = Typography;

const CARD_WIDTH = 260;
const CARD_WIDTH_PLUS_GAP = CARD_WIDTH + 20;
const VISIBLE_CARDS = 2; // Keep for context, although logic uses it implicitly

const ProjectCardCarousel = ({ projectList, activeIndex, setActiveIndex }) => {
  const scrollRef = useRef(null);

  const handleClick = (i) => {
    setActiveIndex(i);
    if (scrollRef.current) {
      // Scroll to the clicked card position
      scrollRef.current.scrollTo({
        left: i * CARD_WIDTH_PLUS_GAP,
        behavior: "smooth",
      });
    }
  };

  return (
    <div ref={scrollRef} className="card-scroll-area">
      <Flex gap={20} className="card-list">
        {projectList.map((item, index) => (
          <Card
            key={item.id}
            className={`custom-project-card ${
              index === activeIndex ? "active-card" : ""
            }`}
            onClick={() => handleClick(index)}
            style={{ width: CARD_WIDTH, height: 190 }}
            variant={false}
          >
            <div className="card-content-wrapper">
              <Title level={4} className="card-title">
                {item.projectName}
              </Title>
              <Text
                className="card-desc"
                style={{
                  color:
                    index === activeIndex ? "#fff" : "rgba(0, 0, 0, 0.45)",
                }}
              >
                Developer: {item.developer?.companyName || "Tidak ada"}
              </Text>

              <Space direction="vertical" size={2} style={{ marginTop: 5 }}>
                <Text strong style={{ color: index === activeIndex ? "#fff" : "#000" }}>
                  <EnvironmentOutlined /> Lat: {item.latitude}
                </Text>
                <Text strong style={{ color: index === activeIndex ? "#fff" : "#000" }}>
                  <EnvironmentOutlined /> Lng: {item.longitude}
                </Text>
              </Space>
            </div>
          </Card>
        ))}
      </Flex>
    </div>
  );
};

export default ProjectCardCarousel;