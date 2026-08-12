import axios from "axios";

// La URL del backend se toma de una variable de entorno de Vite.
// En local usa .env (VITE_API_URL=http://localhost:8000).
// En producción, Vercel/Netlify inyectan la URL del backend desplegado en Render/Railway.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Adjunta el token JWT guardado en cada petición saliente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sinu_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expira o es inválido, cierra sesión automáticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("sinu_token");
      localStorage.removeItem("sinu_usuario");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/** Extrae un mensaje de error legible desde cualquier respuesta del backend. */
export function mensajeError(error) {
  const detalle = error?.response?.data?.detail;
  if (typeof detalle === "string") return detalle;
  if (Array.isArray(detalle)) return detalle.map((d) => d.msg).join(", ");
  return "Ocurrió un error inesperado. Verifica tu conexión con el servidor.";
}
