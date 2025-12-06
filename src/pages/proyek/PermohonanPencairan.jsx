import React, { useState, useEffect, useRef } from "react";
import { Alert, Divider, Form, Button, message } from "antd";
import { useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ProjectInfo from "../../components/proyek/ProjectInfo";
import ProgressSection from "../../components/proyek/ProgressSection";
import DisbursementSteps from "../../components/proyek/DisbursementSteps";
import ProjectData from "../../hook/ProjectData";
import SpinLoader from "../../components/common/SpinLoader";

const PermohonanPencairan = () => {
  const [form] = Form.useForm();
  const uploadRef = useRef();
  const [tempPhotoCoords, setTempPhotoCoords] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const { projectId } = useParams();
  const { projectDetails, fetchProjectsByID, loading: loadingProject } = ProjectData({});

  useEffect(() => {
    if (projectId) fetchProjectsByID(projectId);
  }, [projectId]);

  if (loadingProject)
    return (
      <MainLayout pageTitle="Permohonan Pencairan">
        <SpinLoader tip="Memuat data proyek..." height={400} />
      </MainLayout>
    );

  if (!projectDetails)
    return (
      <MainLayout pageTitle="Permohonan Pencairan">
        <Alert
          message="Proyek tidak ditemukan"
          description={`Data proyek dengan ID ${projectId} tidak tersedia.`}
          type="warning"
          showIcon
          style={{ margin: 20 }}
        />
      </MainLayout>
    );

  const orderedTerms = [...(projectDetails.disbursementTerms || [])].sort((a, b) => a.id - b.id);
  const activeTerm = orderedTerms[activeStep] || null;

  const handleAjukan = async () => {
    try {
      return uploadRef.current.handleUpload();
    } catch (e) {
      console.error(e);
      message.error("Gagal mengajukan pencairan");
    }
  };

  return (
    <MainLayout pageTitle="Permohonan Pencairan">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <ProjectInfo project={projectDetails} />
        <Divider />
        <DisbursementSteps
          disbursementTerms={orderedTerms}
          currentStep={activeStep}
          onStepChange={setActiveStep}
        />
        <ProgressSection
          ref={uploadRef}
          projectDetails={projectDetails}
          form={form}
          tempPhotoCoords={tempPhotoCoords}
          onCoordsUpdate={setTempPhotoCoords}
          activeTerm={activeTerm}
        />
        <Divider />
        <div style={{ textAlign: "right" }}>
          <Button type="primary" onClick={handleAjukan}>
            Ajukan
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default PermohonanPencairan;