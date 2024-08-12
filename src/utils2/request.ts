import axios from "@axios";

const request = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}api/`,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
});

export const setAuth = () => {
  const token = JSON.parse(localStorage.getItem("accessToken") || "{}");
  const refreshToken = token;

  request.defaults.headers.common.Authorization = `Bearer ${refreshToken}`;
};
setAuth();
export default request;
