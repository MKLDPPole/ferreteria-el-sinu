import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { mensajeError } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center mb-3">
            <Store className="text-accent" size={24} />
          </div>
          <h1 className="font-display font-semibold text-xl">Ferretería El Sinú</h1>
          <p className="text-text-muted text-sm mt-1">Sistema de Inventarios</p>
        </div>

        <form onSubmit={manejarEnvio} className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin / vendedor / bodeguero"
              autoFocus
              required
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-danger text-xs bg-danger-bg border border-danger/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="mt-1 bg-accent hover:bg-accent-hover disabled:opacity-60 text-bg font-medium text-sm rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
          >
            {cargando && <Loader2 size={15} className="animate-spin" />}
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-text-muted text-[11px] mt-4">
          admin/admin123 · vendedor/vendedor123 · bodeguero/bodega123
        </p>
      </div>
    </div>
  );
}
