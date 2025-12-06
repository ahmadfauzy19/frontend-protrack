import React from 'react';
import { Card, Button, Typography } from 'antd';
import '../assets/css/CustomCard.css'; // <<< Import file CSS di sini

const { Text } = Typography;

const CustomCard = () => {
  return (
    // Gunakan className kustom untuk menargetkan styling dari file CSS
    <Card
      title="Judul Kartu Kustom"
      extra={<Button type="link" className="custom-extra-link">Lihat Detail</Button>}
      style={{ width: 400 }} // Style inline untuk lebar
      className="custom-antd-card" // Kelas CSS kustom untuk keseluruhan Card
    >
      <Text strong>Informasi Penting:</Text>
      <p className="card-content-text">
        Ini adalah konten utama dari kartu Ant Design yang telah disesuaikan dengan gaya yang unik.
      </p>
      <p className="card-content-text">
        Kita akan mengubah warna latar belakang header, border, dan padding body-nya.
      </p>
      <div className="custom-footer">
        <Text type="secondary">Diperbarui: 27 September 2025</Text>
      </div>
    </Card>
  );
};

export default CustomCard;