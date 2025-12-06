import React, { useContext } from 'react';
import { Layout, Menu, Dropdown, Button, Breadcrumb } from 'antd';
import { FaUser } from 'react-icons/fa';
import { BellFilled, DownOutlined, LogoutOutlined } from '@ant-design/icons';
import '../assets/css/layout.css';
import logo from '../assets/images/layout/logo.png';
import withRouter from '../utils/WithRouter';
// withAuth tidak diperlukan lagi jika kita menggunakan useContext,
// tetapi kita biarkan dulu jika ada alasan lain untuk mempertahankannya.
import { sidebarMenu } from '../config/MenuConfig';
import { AuthContext } from "../contexts/AuthProvider.jsx";

const { Header, Content, Footer, Sider } = Layout;

const profileMenuItems = [
  {
    key: '/profile',
    icon: <FaUser style={{ fontSize: 16 }} />,
    label: (
      <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 'bold' }}>
        Profile
      </span>
    ),
  },
  {
    key: '/logout',
    icon: <LogoutOutlined style={{ color: '#B62021', fontSize: 16 }} />,
    label: (
      <span
        style={{
          color: '#B62021',
          fontFamily: "'Plus Jakarta Sans'",
          fontWeight: 'bold',
        }}
      >
        Keluar
      </span>
    ),
  },
];

const MainLayout = (props) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { user, logout } = useContext(AuthContext);

  const onCollapse = (newCollapsed) => {
    setCollapsed(newCollapsed);
  };

  const handleMenuClick = (e) => {
    const { navigate } = props;
    navigate(e.key);
  };

  const handleProfileMenuClick = async ({ key }) => {
    const { navigate } = props;

    if (key === '/logout') {
      await logout(); // Memanggil fungsi logout dari Context
      navigate('/login');
    } else {
      navigate(key);
    }
  };
  
  // Asumsikan nama pengguna disimpan di user.name atau user.username
  const userName = user?.fullName || user?.username || "Pengguna";

  const breadcrumbs = props.breadcrumbItems || [
    { title: props.pageTitle || 'Dashboard' },
  ];

  const userRoles = user?.roles?.map(r => r.authority) || [];

  return (
    <Layout className="main-layout" style={{ minHeight: '100vh' }}>
      <Sider
        className="custom-sider"
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
      >
        <div className="circle">
          <div className="blur-background" />
          <div className={`logo ${collapsed ? 'collapsed' : ''}`}>
            {!collapsed ? (
              <img src={logo} alt="Logo" className="logo-image" />
            ) : (
              <div className="logo-placeholder" />
            )}
          </div>
        </div>

        <Menu
          className="custom-menu"
          theme="dark"
          selectedKeys={[props.location.pathname]}
          mode="inline"
          items={sidebarMenu
            .filter(item => item.roles.some(role => userRoles.includes(role))) // cek kecocokan
            .map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
            }))}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout className="second-layout">
        <Header className="custom-header">
          <div
            className="header-content"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              minHeight: 64,
            }}
          >
            {collapsed && (
              <div className="logo-header" style={{ display: 'flex', alignItems: 'center' }}>
                <img src={logo} alt="Logo" style={{ maxWidth: 140, marginRight: 16 }} />
              </div>
            )}

            <h1
              style={{
                marginLeft: collapsed ? 70 : 50,
                fontSize: 24,
                fontWeight: 'bold',
                fontFamily: "'Plus Jakarta Sans'",
                color: '#2F348C',
                flex: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {props.pageTitle}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 24 }}>
              <Button
                type="text"
                icon={<BellFilled style={{ fontSize: 22, color: '#2F348C' }} />}
              />
              <Dropdown
                menu={{
                  items: profileMenuItems,
                  onClick: handleProfileMenuClick,
                }}
                trigger={['click']}
              >
                <Button
                  type="text"
                  style={{
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: "'Plus Jakarta Sans'",
                    fontWeight: 600,
                    color: '#fff',
                    background: 'linear-gradient(180deg, #35A6F9 0%, #0762DE 100%)',
                    border: 'none',
                    borderRadius: 24,
                    padding: '6px 18px',
                    boxShadow: '0 2px 8px rgba(118,75,162,0.12)',
                  }}
                >
                  <div
                    style={{
                      background: '#2F348C',
                      borderRadius: '50%',
                      width: 25,
                      height: 25,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FaUser style={{ fontSize: 12, color: '#FFFFFF' }} />
                  </div>
                  <h4 style={{ margin: '0 0 0 8px' }}>{userName}</h4>
                  <DownOutlined style={{ marginLeft: 2, marginTop: 5, fontSize: 12 }} />
                </Button>
              </Dropdown>
            </div>
          </div>
        </Header>

        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbs} />
          {props.children}
        </Content>

        <Footer
          style={{
            marginTop: 40,
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center',
            background: 'transparent',
            padding: '24px 8px',
            fontFamily: "'Plus Jakarta Sans'",
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          <div>
            © 2025 Sistem Monitoring BTN Syariah. All rights reserved.<br />
            Dikembangkan oleh Ahmad Fauzy.<br />
            Kontak:{' '}
            <a
              href="mailto:fauzy15546@gmail.com"
              style={{ color: '#2F348C', textDecoration: 'underline' }}
            >
              fauzy15546@gmail.com
            </a>{' '}
            | Versi 1.0.0
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default withRouter(MainLayout);