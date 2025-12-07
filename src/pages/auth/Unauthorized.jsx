import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Unauthorized = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          borderRadius: 12,
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          padding: '40px 20px',
        }}
        variant="borderless"
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <CloseCircleOutlined style={{ fontSize: 60, color: '#ff4d4f' }} />
          <Title level={2}>403 - Tidak Punya Akses</Title>
          <Paragraph style={{ fontSize: 16, color: '#595959' }}>
            Maaf, Anda tidak memiliki hak akses untuk melihat halaman ini.
            Hubungi admin jika ini merupakan kesalahan.
          </Paragraph>
          <Link to="/dashboard">
            <Button type="primary" size="large" style={{ borderRadius: 8 }}>
              Kembali ke Dashboard
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default Unauthorized;
