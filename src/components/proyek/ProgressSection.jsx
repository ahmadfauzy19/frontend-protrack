import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Collapse, Card, message } from "antd";
import ProgressUploadForm from "./ProgressUploadForm";
import ProjectMap from "../custom_carousel/ProjectMap";

const ProgressSection = forwardRef(
  ({ projectDetails, form, tempPhotoCoords, onCoordsUpdate, activeTerm }, ref) => {
    const formRef = useRef(null);

    // Fungsi dipanggil dari parent (PermohonanPencairan)
    useImperativeHandle(ref, () => ({
      async handleUpload() {
        if (!formRef.current) {
          message.error("Form upload belum siap");
          return;
        }
        if (!activeTerm) {
          message.warning("Pilih termin terlebih dahulu sebelum mengajukan.");
          return;
        }

        // Panggil fungsi submit dari ProgressUploadForm
        if (formRef.current.handleUpload) {
            return await formRef.current.handleUpload(); 
        } else {
          message.error("Upload handler tidak ditemukan");
        }
      },
    }));

    return (
      <Collapse
        bordered
        defaultActiveKey={["2"]}
        items={[
          {
            key: "2",
            label: (
              <div style={{ color: "white", fontWeight: 600 }}>
                Upload Progress Termin
              </div>
            ),
            style: { backgroundColor: "#0A67E0", borderRadius: 12 },
            children: (
              <>
                {/* === Form Upload Foto Progress === */}
                <ProgressUploadForm
                  ref={formRef} 
                  currentLocation={projectDetails}
                  form={form}
                  onCoordsUpdate={onCoordsUpdate}
                  activeTerm={activeTerm}
                />

                {/* === Map Lokasi === */}
                <Card
                  style={{
                    marginTop: 10,
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <ProjectMap
                    currentLocation={projectDetails}
                    photoLocation={tempPhotoCoords}
                    activeTerm={activeTerm}
                  />
                </Card>
              </>
            ),
          },
        ]}
      />
    );
  }
);

export default ProgressSection;
