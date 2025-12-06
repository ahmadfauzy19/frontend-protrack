import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from './pages/Dashboard';
import Developer from './pages/developer/Developer';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Proyek from './pages/proyek/Proyek.jsx';
import KoordinatProyek from './pages/proyek/KoordinatProyek';
import Login from './pages/auth/Login.jsx';
import PermohonanPencairan from './pages/proyek/PermohonanPencairan.jsx';
import AuthProvider from './contexts/AuthProvider.jsx';
import ProtectedRoutes from "./routes/ProtectedRoutes.jsx";
import PageEditProyek from "./pages/proyek/PageEditProyek.jsx";
import PageViewProyek from "./pages/proyek/PageViewProyek.jsx";
import DaftarPermohonanPencairan from './pages/proyek/DaftarPermohonanPencairan.jsx';
import Unauthorized from './pages/auth/Unauthorized.jsx';
import LihatPermohonanPencairan from './pages/proyek/LihatPermohonanPencairan.jsx';
import Report from './pages/developer/Report.jsx';
import DeveloperDashboardDetail from './pages/DeveloperDashboardDetail.jsx';
import TambahProyek from './pages/proyek/ModalTambahProyek.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
      <>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/dashboard" 
                element={
                  <ProtectedRoutes>
                    <Dashboard />
                  </ProtectedRoutes>
                }
              />
              <Route path="/developer" 
                element={
                  <ProtectedRoutes>
                    <Developer />
                  </ProtectedRoutes>
                }
              />
              <Route path="/report-developer" 
                element={
                  <ProtectedRoutes>
                    <Report />
                  </ProtectedRoutes>
                }
              />
              <Route path="/report-developer-detail/:id" 
                element={
                  <ProtectedRoutes>
                    <DeveloperDashboardDetail />
                  </ProtectedRoutes>
                }
              />
              <Route path="/project" 
                element={
                  <ProtectedRoutes>
                    <Proyek />
                  </ProtectedRoutes>
                }
              />
              <Route path="/project-add" 
                element={
                  <ProtectedRoutes>
                    <TambahProyek />
                  </ProtectedRoutes>
                }
              />
              
              <Route path="/project-request" 
                element={
                  <ProtectedRoutes allowedRoles={['REVIEWER', 'ADMIN']}>
                    <DaftarPermohonanPencairan />
                  </ProtectedRoutes>
                }
              />
              <Route path="/project-request/:projectId" 
                element={
                  <ProtectedRoutes allowedRoles={['REVIEWER', 'ADMIN']}>
                    <LihatPermohonanPencairan />
                  </ProtectedRoutes>
                }
              />
              <Route path="/koordinat-proyek" 
                element={
                  <ProtectedRoutes>
                    <KoordinatProyek />
                  </ProtectedRoutes>
                }
              />
              <Route path="/proyek/edit/:projectId"
                element={
                  <ProtectedRoutes>
                    <PageEditProyek />
                  </ProtectedRoutes>
                }
              />
               <Route path="/proyek/view/:projectId"
                element={
                  <ProtectedRoutes>
                    <PageViewProyek />
                  </ProtectedRoutes>
                }
              />
              <Route path="/permohonan-pencairan/:projectId"
                element={
                  <ProtectedRoutes>
                    <PermohonanPencairan />
                  </ProtectedRoutes>
                }
              />
          </Routes>
      </>
  )
}

export default App
