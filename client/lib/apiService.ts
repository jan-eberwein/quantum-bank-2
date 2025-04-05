import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Generic API Service
const apiService = {
    get: async <T>(url: string, token?: string): Promise<T> => {
        try {
            const response = await axios.get<T>(`${API_BASE_URL}${url}`, {
                headers: {
                    Authorization: token || '',
                },
            });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },
    post: async <T>(url: string, data: unknown, token?: string): Promise<T> => {
        try {
            const response = await axios.post<T>(`${API_BASE_URL}${url}`, data, {
                headers: {
                    Authorization: token || '',
                },
            });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },
    // Additional methods (put, delete, etc.) can be added as needed
};


const handleError = (error: any) => {
    // Handle API errors (e.g., log or show a toast notification)
    console.error("API Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Something went wrong. Please try again.");
};

export default apiService;
