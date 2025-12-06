import api from "../../utils/AxiosInstance";

export const getAllProjects = async ({ page = 0, size = 10, sortBy = "id", direction = "asc" }) => {
  try {
    const response = await api.get(`/projects`, {
      params: { page, size, sortBy, direction },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const getAllProjectsRequest = async ({ page = 0, size = 10, sortBy = "id", direction = "asc" }) => {
  try {
    const response = await api.get(`/projects/need-verification`, {
      params: { page, size, sortBy, direction },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const getAllProjectsPengajuan = async ({ page = 0, size = 10, sortBy = "id", direction = "asc" }) => {
  try {
    const response = await api.get(`/projects/pengajuan`, {
      params: { page, size, sortBy, direction },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};


export const getProjectsById = async (id) => {
    try {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching project by ID:", error);
        throw error;
    }
};

export const createProject = async (projectData) => {
    try {
        const response = await api.post("/projects", projectData);
        return response.data;
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
};

export const updateProject = async (id, projectData) => {
    try {
        const response = await api.put(`/projects/${id}`, projectData);
        return response.data;
    } catch (error) {
        console.error("Error updating project:", error);
        throw error;
    }
};

export const deleteProject = async (id) => {
    try {
        const response = await api.delete(`/projects/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting project:", error);
        throw error;
    }
};

import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

export const uploadProgress = async (data) => {
  const token = localStorage.getItem("authToken");
  const url = `${API_URL}/projects/upload`;

  const config = {};
  if (token) {
    config.headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await axios.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const putStatusDocument = async (id, status) => {
  try {
    const response = await api.patch(`/progress-documents/${id}/validate?status=${status}`);
    return response.data;
  } catch (error) {
    console.error("Error updating document status:", error);
    throw error;
  }
};
