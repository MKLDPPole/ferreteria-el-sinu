import { useEffect, useState } from "react";
import { UserPlus, Loader2, ShieldCheck } from "lucide-react";
import { usuariosApi } from "../api/endpoints";
import { mensajeError } from "../api/client";

const ROLES = ["ADMIN", "VENDEDOR", "BODEGUERO"];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("VENDEDOR");

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      setUsuarios(await usuariosApi.listar());
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setCargando(false);
    }
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    setExito("");
    try {
      await usuariosApi.crear({ nombre, username, password, rol });
      setExito(`Usuario "${username}" creado correctamente.`);
      setNombre("");
      setUsername("");
      setPassword("");
      setRol("VENDEDOR");
      cargar();
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-semibold text-xl mb-1">Usuarios</h1>
      <p className="text-text-muted text-sm mb-6">
        Gestión de usuarios y roles del sistema (solo visible para ADMIN).
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-medium text-text-muted mb-3">Crear nuevo usuario</h2>
          <form onSubmit={manejarEnvio} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Contraseña (mín. 6 caracteres)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Rol</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-danger text-xs bg-danger-bg border border-danger/30 rounded-lg px-3 py-2">{error}</p>
            )}
            {exito && (
              <p className="text-success text-xs bg-success/10 border border-success/30 rounded-lg px-3 py-2">{exito}</p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-bg font-medium text-sm rounded-lg py-2.5 flex items-center justify-center gap-2 mt-1"
            >
              {enviando ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
              Crear usuario
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-sm font-medium text-text-muted mb-3">Usuarios existentes</h2>
          <div className="bg-surface border border-border rounded-xl divide-y divide-border">
            {cargando ? (
              <div className="flex items-center gap-2 text-text-muted text-sm px-4 py-4">
                <Loader2 className="animate-spin" size={15} /> Cargando...
              </div>
            ) : (
              usuarios.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{u.nombre}</p>
                    <p className="text-[11px] text-text-muted font-mono">@{u.username}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-accent bg-accent/10 px-2 py-1 rounded-md">
                    <ShieldCheck size={12} /> {u.rol}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}