import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000" });

export const getTasks = () => API.get("/tasks");
export const addTask = (task) => API.post("/tasks", task); // Fixed parameter
export const toggleTask = (id) => API.put(`/tasks/${id}`);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
