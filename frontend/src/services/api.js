
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getFoods(search = "") {
  const response = await api.get("/foods", {
    params: search ? { search } : {},
  });

  return response.data;
}

export async function createFood(food) {
  const response = await api.post("/foods", food);
  return response.data;
}

export async function updateFood(id, food) {
  const response = await api.put(`/foods/${id}`, food);
  return response.data;
}

export async function deleteFood(id) {
  const response = await api.delete(`/foods/${id}`);
  return response.data;
}
