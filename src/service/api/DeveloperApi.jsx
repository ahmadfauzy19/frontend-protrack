import api from "../../utils/AxiosInstance";

export const getAllDevelopers = async ({ page = 0, size = 10, sortBy = "id", direction = "asc" }) => {
  try {
    const response = await api.get(`/developer/list`, {
      params: { page, size, sortBy, direction },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching developers:", error);
    throw error;
  }
};

export const getDeveloperById = async (id) => {
    try {
        const response = await api.get(`/developer/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching developer by ID:", error);
        throw error;
    }
};

export const createDeveloper = async (developerData) => {
    try {
        const response = await api.post("/developer", developerData);
        return response.data;
    } catch (error) {
        console.error("Error creating developer:", error);
        throw error;
    }
};

export const updateDeveloper = async (id, developerData) => {
    try {
        const response = await api.put(`/developer/${id}`, developerData);
        return response.data;
    } catch (error) {
        console.error("Error updating developer:", error);
        throw error;
    }
};

export const deleteDeveloper = async (id) => {
    try {
        const response = await api.delete(`/developer/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting developer:", error);
        throw error;
    }
};

export const getDeveloperDropdown = async () => {
    try{
        const response = await api.get("/developer/dropdown");
        return response.data;
    } catch (error) {
        console.error("Error get dropdown developer:" , error)
        throw error;
    }
};

export const getAllLogicDisbursement = async () => {
  try {
    const response = await api.get(`/developer/all-logic-disbursement`);
    return response.data;
  } catch (error) {
    console.error("Error fetching LogicDisbursementByTier:", error);
    throw error;
  }
};