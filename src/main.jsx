// src/main.jsx
import "leaflet/dist/leaflet.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.jsx";
import "./index.css";
import { App as AntApp } from "antd";

// Tambahkan ini 👇
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";

// (Opsional) kalau kamu pakai AuthProvider, import di sini juga
import AuthProvider from "./contexts/AuthProvider.jsx";

// 1️⃣ Buat instance QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 2️⃣ Bungkus App dengan provider global
ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* Kalau kamu pakai AuthProvider, taruh di sini */}
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          {/* Tambahkan devtools untuk debugging query */}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
