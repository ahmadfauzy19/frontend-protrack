import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  FileSyncOutlined,
} from '@ant-design/icons';

export const sidebarMenu = [
  {
    key: '/dashboard',
    label: 'Dashboard',
    icon: <DashboardOutlined style={{ fontSize: 25, fontWeight: 'bold' }} />,
    roles: ['ADMIN', 'EMPLOYEE', 'REVIEWER'], // semua role bisa akses
  },
  {
    key: '/developer',
    label: 'Developer',
    icon: <TeamOutlined style={{ fontSize: 25, fontWeight: 'bold' }} />,
    roles: ['ADMIN'], // hanya admin
  },
  {
    key: '/project',
    label: 'Project',
    icon: <ProjectOutlined style={{ fontSize: 25, fontWeight: 'bold' }} />,
    roles: ['ADMIN', 'EMPLOYEE', 'REVIEWER'],
  },
  {
    key: '/project-request',
    label: 'Permohonan Pencairan',
    icon: <FileSyncOutlined style={{ fontSize: 25, fontWeight: 'bold' }} />,
    roles: ['REVIEWER', 'ADMIN'], // hanya reviewer dan admin
  },
];
