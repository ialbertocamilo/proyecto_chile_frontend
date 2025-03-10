import axios, { AxiosRequestConfig } from "axios";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "https://localhost:8000";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = async <T>(method: "get" | "post" | "put" | "delete" | "patch", endpoint: string, data?: any, config?: AxiosRequestConfig) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    const headers = {
      ...config?.headers,
      Authorization: token ? `Bearer ${token}` : "",
    };

    try {
      const response = await axios({
        method,
        url: `${API_BASE_URL}/${endpoint}`,
        data,
        ...config,
        headers,
      });
      return response.data as T;
    } catch (err) {
      setError("Error en la petición");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    get: <T>(endpoint: string, config?: AxiosRequestConfig) => request<T>("get", endpoint, null, config),
    post: <T>(endpoint: string, data: any, config?: AxiosRequestConfig) => request<T>("post", endpoint, data, config),
    put: <T>(endpoint: string, data: any, config?: AxiosRequestConfig) => request<T>("put", endpoint, data, config),
    patch: <T>(endpoint: string, data: any, config?: AxiosRequestConfig) => request<T>("patch", endpoint, data, config),
    del: <T>(endpoint: string, config?: AxiosRequestConfig) => request<T>("delete", endpoint, null, config),
    loading,
    error,
  };
}
