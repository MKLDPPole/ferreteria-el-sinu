import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RutaPrivada from "./components/RutaPrivada";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RegistrarMovimiento from "./pages/RegistrarMovimiento";
import Productos from "./pages/Productos";
import FichaProducto from "./pages/FichaProducto";
import Alertas from "./pages/Alertas";
import Usuarios from "./pages/Usuarios";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RutaPrivada>
                <Layout />
              </RutaPrivada>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/movimiento" element={<RegistrarMovimiento />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/:id" element={<FichaProducto />} />
            <Route path="/alertas" element={<Alertas />} />
			<Route path="/usuarios" element={<Usuarios />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
