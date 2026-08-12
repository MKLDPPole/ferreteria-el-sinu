import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, PackageSearch, AlertTriangle, LogOut, Store, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const enlacesBase = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, fin: true },
  { to: "/movimiento", label: "Registrar movimiento", icon: ArrowLeftRight },
  { to: "/productos", label: "Productos", icon: PackageSearch },
  { to: "/alertas", label: "Alertas de stock", icon: AlertTriangle },
];

function enlacesPara(rol) {
  if (rol === "ADMIN") {
    return [...enlacesBase, { to: "/usuarios", label: "Usuarios", icon: Users }];
  }
  return enlacesBase;
}

export default function Layout() {
  const { usuario, logout } = useAuth();
  const enlaces = enlacesPara(usuario?.rol);
  const navigate = useNavigate();

  function cerrarSesion() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-bg text-text font-body">
      <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <Store className="text-accent" size={22} />
          <div>
            <p className="font-display font-semibold text-sm leading-tight">Ferretería El Sinú</p>
            <p className="text-[11px] text-text-muted leading-tight">Sistema de Inventarios</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {enlaces.map(({ to, label, icon: Icon, fin }) => (
            <NavLink
              key={to}
              to={to}
              end={fin}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-accent/15 text-accent font-medium"
                    : "text-text-muted hover:bg-surface-hover hover:text-text"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-success" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{usuario?.nombre}</p>
              <p className="text-[11px] text-text-muted">{usuario?.rol}</p>
            </div>
          </div>
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
