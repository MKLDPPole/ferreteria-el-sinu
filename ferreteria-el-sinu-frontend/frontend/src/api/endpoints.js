import { api } from "./client";

export const authApi = {
  login: (username, password) =>
    api.post("/api/auth/login", { username, password }).then((r) => r.data),
};

export const productosApi = {
  listar: (params = {}) => api.get("/api/productos", { params }).then((r) => r.data),
  obtener: (id) => api.get(`/api/productos/${id}`).then((r) => r.data),
  crear: (datos) => api.post("/api/productos", datos).then((r) => r.data),
  actualizar: (id, datos) => api.put(`/api/productos/${id}`, datos).then((r) => r.data),
  eliminar: (id) => api.delete(`/api/productos/${id}`).then((r) => r.data),
  alertas: () => api.get("/api/productos/alertas").then((r) => r.data),
};

export const movimientosApi = {
  registrar: (datos) => api.post("/api/movimientos", datos).then((r) => r.data),
  listar: (params = {}) => api.get("/api/movimientos", { params }).then((r) => r.data),
};

export const categoriasApi = {
  listar: () => api.get("/api/categorias").then((r) => r.data),
};

 export const usuariosApi = { listar: () => api.get("/api/usuarios").then((r) => r.data), crear: (datos) => api.post("/api/usuarios", datos).then((r) => r.data), };