import React, { useState, useEffect } from "react";
import { Flex, Button, Typography, Alert, Form, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ProjectData from "../../hook/ProjectData"; // Adjust path as necessary
import SpinLoader from "../common/SpinLoader";
import ProjectCardCarousel from "./ProjectCardCarousel";
import ProjectMap from "./ProjectMap";
import ProgressUploadModal from "../custom_carousel/ProgressUploadModal";

const { Title, Text } = Typography;

const CustomCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();
  const [tempPhotoCoords, setTempPhotoCoords] = useState(null);

  // Ambil data project
  const { projectList, loading: loadingProject } = ProjectData({});

  // Effect to update currentLocation when projectList or activeIndex changes
  useEffect(() => {
    if (!projectList?.length) {
      setCurrentLocation(null);
      return;
    }
    const active = projectList[activeIndex];
    setCurrentLocation(active);
    // Note: Map update logic is now handled inside ProjectMap component
  }, [activeIndex, projectList]);

  // ------------------ RENDER ------------------
  if (loadingProject) {
    return <SpinLoader tip="Memuat data proyek..." />;
  }

  if (!projectList?.length) {
    return (
      <Alert
        message="Informasi"
        description="Tidak ada data proyek yang tersedia saat ini."
        type="info"
        showIcon
        style={{ margin: 20 }}
      />
    );
  }

  const handleModalCancel = () => {
    setOpenModal(false);
    setTempPhotoCoords(null); // Clear visualization when modal closes
  };
  
  // NEW HANDLER: Dipanggil dari ProgressUploadModal
  const handlePhotoCoordsUpdate = (coords) => {
    setTempPhotoCoords(coords);
  };
  return (
    <div className="carousel-container">
      <Title level={2} style={{ textAlign: "center", marginBottom: 20 }}>
        Daftar Proyek & Lokasi
      </Title>

      {/* --- CARD SCROLL AREA --- */}
      <ProjectCardCarousel
        projectList={projectList}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />

      {/* --- MAP CONTROL + BUTTON --- */}
      <Flex justify="space-between" align="center" style={{ margin: "15px 0" }}>
        <Card size="small" style={{ flexGrow: 1, marginRight: 20 }}>
          <Text type="secondary">Lokasi Aktif:</Text>{" "}
          {currentLocation && (
            <Text strong>
              {currentLocation.projectName} ({currentLocation.latitude},{" "}
              {currentLocation.longitude})
            </Text>
          )}
        </Card>

        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => setOpenModal(true)}
          disabled={!currentLocation?.disbursementTerms?.length}
        >
          Upload Progress
        </Button>
      </Flex>

      {/* --- MAP & TABLE --- */}
      <ProjectMap 
        currentLocation={currentLocation} 
        photoLocation={tempPhotoCoords} // NEW PROP
      />

      {/* --- MODAL UPLOAD PROGRESS --- */}
      <ProgressUploadModal
        openModal={openModal}
        setOpenModal={handleModalCancel} // Use new handler
        currentLocation={currentLocation}
        form={form}
        onCoordsUpdate={handlePhotoCoordsUpdate} // NEW PROP
      />
    </div>
  );
};

export default CustomCarousel;