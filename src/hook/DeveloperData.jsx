// src/pages/developer/DeveloperData.jsx
import React, { useEffect, useState } from "react";
import { getAllDevelopers, deleteDeveloper } from "../service/api/DeveloperApi";
import { message } from "antd";

const DeveloperData = ({ onDataLoaded }) => {
  const [developerList, setDeveloperList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 🔹 Fetch data dari API
  const fetchDevelopers = async (page = 1, size = 10, sortBy = "id", direction = "asc") => {
    try {
      setLoading(true);
      const response = await getAllDevelopers({
        page: page - 1,
        size: size,
        sortBy: sortBy,
        direction: direction,
      });

      const { data, pagination: apiPagination } = response;
      setDeveloperList(data);

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
      console.error("Error fetching developers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteDeveloper(id);
      fetchDevelopers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error deleting developer:", error.response.data.message);
      message.error(`Error Deleting Developer: ${error.response.data.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers(pagination.current, pagination.pageSize);
  }, []);

  return {
    developerList,
    loading,
    pagination,
    fetchDevelopers,
    handleDelete,
  };
};

export default DeveloperData;
