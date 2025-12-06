import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Form, Input, Upload, Button, Typography, Card, Image, Row, Col, Divider, message } from "antd";
import { UploadOutlined, PictureOutlined } from "@ant-design/icons";
import { uploadProgress } from "../../service/api/ProjectApi";
import { getPhotoAndDistance } from "../../utils/GeoUtils";

const { Text } = Typography;

const PHOTO_REQUIREMENTS = {
  Started: ["Tampak Depan", "Tampak Tanah Pondasi", "Tampak Jalan"],
  Foundation: ["Tampak Depan", "Tampak Jalan"],
  Roofing: [
    "Tampak Depan",
    "Tampak Dalam (salah satu ruangan)",
    "Tampak Meteran Listrik",
    "Tampak Meteran Air",
    "Tampak Jalan",
    "Taluran/Drainase"
  ],
  Finishing: ["Tampak Depan", "Tampak Dalam Rumah", "Tampak Jalan", "Sertifikat BAST"],
};

const BASE_URL = "http://localhost:8081" || "http://localhost:3000";

const ProgressUploadForm = forwardRef(
  ({ currentLocation, form, onCoordsUpdate, activeTerm }, ref) => {
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [coordSource, setCoordSource] = useState(null);
    const [photoList, setPhotoList] = useState([]);

    useEffect(() => {
      if (activeTerm) {
        const firstPhoto = activeTerm.progressDocuments?.[0];
        const photoCoordinates = firstPhoto?.photoCoordinates || "";
        const distanceFromLocation = firstPhoto?.distanceFromLocation || 0;
        form.resetFields();
        form.setFieldsValue({
          disbursementTermId: activeTerm.id,
          progressStage: activeTerm.progressStage,
          physicalPercentage: activeTerm.physicalPercentage,
          photoCoordinates: photoCoordinates,
          distanceFromLocation: distanceFromLocation,
        });
        const tahap = activeTerm.progressStage;
        setPhotoList(PHOTO_REQUIREMENTS[tahap] || []);
      }
    }, [activeTerm, form]);

    const handleMainPhotoChange = async (info, label) => {
      const file = info.fileList[0]?.originFileObj;
      if (!file) {
        form.setFieldsValue({
          photoCoordinates: "",
          distanceFromLocation: 0,
        });
        setCoordSource(null);
        onCoordsUpdate(null);
        return;
      }

      try {
        const result = await getPhotoAndDistance(
          file,
          currentLocation.latitude,
          currentLocation.longitude,
          form
        );

        setCoordSource(result.source);
        form.setFieldsValue({
          photoCoordinates: `${result.coords.lat}, ${result.coords.lng}`,
          distanceFromLocation: result.distance,
        });

        onCoordsUpdate(result.coords);

        if (result.source === "metadata") {
          message.success(`Koordinat ${label} dibaca dari metadata foto!`);
        } else {
          message.warning(`Foto ${label} tidak punya metadata GPS, gunakan lokasi perangkat.`);
        }
      } catch (err) {
        console.error("Gagal memproses foto:", err);
        message.error("Gagal membaca metadata foto");
        setCoordSource("error");
        onCoordsUpdate(null);
      }
    };

    const renderSourceMessage = () => {
      switch (coordSource) {
        case "metadata":
          return <Text type="success">Sumber: Metadata EXIF</Text>;
        case "geolocation":
          return <Text type="warning">Sumber: Lokasi perangkat</Text>;
        case "error":
          return <Text type="danger">Gagal membaca koordinat</Text>;
        default:
          return <Text type="secondary">Unggah foto utama (Tampak Depan) untuk koordinat otomatis</Text>;
      }
    };

    // === UPLOAD HANDLER ===
    const handleUpload = async () => {
      try {
        const values = await form.validateFields();
        setLoadingSubmit(true);

        const formData = new FormData();
        formData.append("disbursementTermId", activeTerm?.id);
        formData.append("photoCoordinates", values.photoCoordinates || "");
        formData.append("distanceFromLocation", values.distanceFromLocation || 0);

        photoList.forEach((label) => {
          const field = `file_${label}`;
          const file = values[field]?.[0]?.originFileObj;
          if (file) {
            formData.append("file", file, `${label}.jpg`);
            formData.append("description", label);
          }
        });

        await uploadProgress(formData);
        message.success("Semua foto progress berhasil diupload!");
        form.resetFields();
        setCoordSource(null);
        onCoordsUpdate(null);
      } catch (error) {
        console.error(error);
        message.error("Gagal mengupload progress");
      } finally {
        setLoadingSubmit(false);
      }
    };

    useImperativeHandle(ref, () => ({
      handleUpload,
    }));

    if (!activeTerm) {
      return (
        <Card style={{ marginTop: 10 }}>
          <Text type="secondary">
            Pilih tahap termin terlebih dahulu dari langkah di atas untuk mengunggah progress.
          </Text>
        </Card>
      );
    }

    // === FOTO TERSEDIA ===
    const existingPhotos = activeTerm.progressDocuments || [];

    return (
      <Form layout="vertical" form={form}>
        <Form.Item label="Tahap Termin">
          <Input value={activeTerm?.progressStage} readOnly />
        </Form.Item>

        <Form.Item label="Persentase Fisik">
          <Input value={`${activeTerm?.physicalPercentage ?? 0}%`} readOnly />
        </Form.Item>

        {/* === FOTO TERSEDIA SAAT INI === */}
        {existingPhotos.length > 0 && (
          <>
            <Divider />
            <Text strong style={{ fontSize: 15 }}>
              Foto Progress Tersimpan
            </Text>
            <Row gutter={[12, 12]} style={{ marginTop: 10 }}>
              {existingPhotos.map((photo) => {
                // Ambil deskripsi dari nama file
                const fileName = photo.photoUrl?.split("/").pop() || "";
                const descriptionFromFile = fileName
                  .split("_")
                  .slice(1) // buang prefix timestamp
                  .join(" ") // ubah underscore jadi spasi
                  .replace(/\.[^/.]+$/, "") // hapus ekstensi (.jpg, .png)
                  .trim();

                const displayDescription = descriptionFromFile || "Foto Progress";

                return (
                  <Col xs={24} sm={12} md={8} key={photo.id}>
                    <Card
                      hoverable
                      cover={
                        <Image
                          src={`${BASE_URL}${photo.photoUrl}`}
                          alt={displayDescription}
                          style={{
                            borderRadius: 8,
                            height: 180,
                            objectFit: "cover",
                          }}
                        />
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <PictureOutlined />
                          <Text strong>{displayDescription}</Text>
                        </div>

                        {/* === STATUS VALIDATION === */}
                        {(() => {
                          // Normalisasi sumber status: cek `photo.status` dulu, fallback ke `validationStatus`
                          let status = (photo.status || "").toString().toUpperCase();
                          if (!status) {
                            status = photo.status
                          }

                          if (status === "VERIFIED") {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  color: "#52c41a",
                                  fontWeight: 500,
                                }}
                              >
                                <span
                                  style={{
                                    border: "1px solid #52c41a",
                                    borderRadius: "50%",
                                    width: 18,
                                    height: 18,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                  }}
                                >
                                  ✓
                                </span>
                                <span>Verified</span>
                              </div>
                            );
                          }

                          if (status === "DECLINED") {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  color: "#ff4d4f",
                                  fontWeight: 500,
                                }}
                              >
                                <span
                                  style={{
                                    border: "1px solid #ff4d4f",
                                    borderRadius: "50%",
                                    width: 18,
                                    height: 18,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                  }}
                                >
                                  ✕
                                </span>
                                <span>Declined</span>
                              </div>
                            );
                          }

                          // Default: NOT_VERIFIED
                          return (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                color: "#faad14",
                                fontWeight: 500,
                              }}
                            >
                              <span
                                style={{
                                  border: "1px solid #faad14",
                                  borderRadius: "50%",
                                  width: 18,
                                  height: 18,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 12,
                                }}
                              >
                                !
                              </span>
                              <span>Not Verified</span>
                            </div>
                          );
                        })()}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
            <Divider />
          </>
        )}

        {/* === FORM UPLOAD FOTO BARU === */}
        {photoList.map((label) => {
          const isMain = /depan/i.test(label);

          // Ambil data foto lama yang cocok dengan label
          const existingPhoto = activeTerm?.progressDocuments?.find((photo) =>
            photo.photoUrl?.toLowerCase().includes(label.toLowerCase().replace(/\s+/g, "_"))
          );

          const isVerified = existingPhoto?.status === "VERIFIED";
          const photoUrl = existingPhoto ? `${BASE_URL}${existingPhoto.photoUrl}` : null;
          const descriptionFromFile = existingPhoto
            ? existingPhoto.photoUrl.split("/").pop().replace(/\.[^/.]+$/, "").split("_").slice(1).join(" ")
            : label;
          
          return (
            <Form.Item
              key={label}
              label={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>
                    {descriptionFromFile}
                    {isMain ? " (Foto Utama)" : ""}
                  </span>
                </div>
              }
              name={`file_${label}`}
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              rules={
                !isVerified
                  ? [{ required: true, message: `Upload ${label} wajib` }]
                  : []
              }
            >
              {/* === Upload Button (Disable kalau sudah verified) === */}
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                onChange={isMain ? (info) => handleMainPhotoChange(info, label) : undefined}
                disabled={isVerified}
              >
                <Button icon={<UploadOutlined />} disabled={isVerified}>
                  {isVerified ? "Sudah Diverifikasi" : `Pilih Foto ${label}`}
                </Button>
              </Upload>
            </Form.Item>
          );
        })}

        {photoList.some((label) => /depan/i.test(label)) && (
          <>
            <Form.Item
              label="Koordinat Foto Utama"
              name="photoCoordinates"
              extra={renderSourceMessage()}
            >
              <Input placeholder="latitude, longitude" disabled />
            </Form.Item>

            <Form.Item label="Jarak dari Lokasi (meter)" name="distanceFromLocation">
              <Input disabled />
            </Form.Item>
          </>
        )}
      </Form>
    );
  }
);

export default ProgressUploadForm;
