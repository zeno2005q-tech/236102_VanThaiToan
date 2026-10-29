import axios from "axios";

const API = axios.create({
  baseURL: "",
});

export const getFoods = async (search = "") => {
  const response = await API.get(
    `/api/foods${search ? `?search=${encodeURIComponent(search)}` : ""}`
  );
  // Trả về trực tiếp mảng món ăn bên trong response.data.data
  return response.data.data;
};

export const createFood = async (foodData) => {
  const response = await API.post("/api/foods", foodData);
  return response.data;
};

export const updateFood = async (id, foodData) => {
  const response = await API.put(`/api/foods/${id}`, foodData);
  return response.data;
};

export const deleteFood = async (id) => {
  const response = await API.delete(`/api/foods/${id}`);
  return response.data;
};