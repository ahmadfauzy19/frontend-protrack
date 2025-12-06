import api from "../../utils/AxiosInstance";

export const fetchDashboardData = async ({ page = 0, size = 10}) => {
    try {
      const response = await api.get('/dashboard/developer-report', {params: {page, size}});
      return response.data;
    } catch (err) {
      console.error("Error fetching data dashboard:", err);
        throw err;
    }
  };

export const fetchDeveloperDashboardDetail = async ({developerId, page = 0, size = 10}) => {
  try {
    const res = await api.get(`/dashboard/developer-report/${developerId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching developer detail:", err);
    throw err;
  }
};

export const fetchDashboardDataSummary = async () => {
  try {
    const response = await api.get('/dashboard/summary');
    return response.data;
  }catch (err) {
    console.error("error fetching data summary:", err)
    throw err;
  }
}