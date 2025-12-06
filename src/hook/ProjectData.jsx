// src/pages/developer/DeveloperData.jsx
import React, { useEffect, useState } from "react";
import { getAllProjects, deleteProject, getProjectsById, getAllProjectsRequest } from "../service/api/ProjectApi";

const ProjectData = ({ onDataLoaded }) => {
  const [projectList, setProjectList] = useState([]);
  const [projectRequest, setProjectRequest] = useState([]);
  const [paginationRequest, setPaginationRequest] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 🔹 Fetch data dari API
  const fetchProjects = async (page = 1, size = 10, sortBy = "id", direction = "asc") => {
    try {
      setLoading(true);
      const response = await getAllProjects({
        page: page - 1,
        size: size,
        sortBy: sortBy,
        direction: direction,
      });

      const { data, pagination: apiPagination } = response;
      setProjectList(data);

      setPagination({
        current: apiPagination.page + 1,
        pageSize: apiPagination.size,
        total: apiPagination.totalElements,
      });

      if (onDataLoaded) {
        onDataLoaded({
          developers: data,
          pagination: {
            current: apiPagination.page + 1,
            pageSize: apiPagination.size,
            total: apiPagination.totalElements,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsRequest = async (page = 1, size = 10, sortBy = "id", direction = "asc") => {
    try {
      setLoading(true);
      const response = await getAllProjectsRequest({
        page: page - 1,
        size: size,
        sortBy: sortBy,
        direction: direction,
      });

      const { data, pagination: apiPagination } = response;
      setProjectRequest(data);

      setPaginationRequest({
        current: apiPagination.page + 1,
        pageSize: apiPagination.size,
        total: apiPagination.totalElements,
      });

      if (onDataLoaded) {
        onDataLoaded({
          developers: data,
          pagination: {
            current: apiPagination.page + 1,
            pageSize: apiPagination.size,
            total: apiPagination.totalElements,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsByID = async (id) => {
    try {
      setLoading(true);
      const response = await getProjectsById(id);

      const { data } = response;
      setProjectDetails(data);
    } catch (error) {
      console.error("Error fetching project by ID:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteProject(id);
      fetchProjects(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(pagination.current, pagination.pageSize);
  }, []);

  return {
    projectList,
    projectDetails,
    loading,
    pagination,
    paginationRequest,
    projectRequest,
    fetchProjects,
    handleDelete,
    fetchProjectsByID,
    fetchProjectsRequest,
  };
};

export default ProjectData;
