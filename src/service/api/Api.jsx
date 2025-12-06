import api from "../../utils/AxiosInstance";

export const loginUser = async (email, password) => {
    try {
        const response = await api.post("/login", { email, password });
        return response.data;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
};

export const logoutUser = async (token) => {
    try {
        await api.post("/logout", {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error("Error logging out:", error);
        throw error;
    }
};
