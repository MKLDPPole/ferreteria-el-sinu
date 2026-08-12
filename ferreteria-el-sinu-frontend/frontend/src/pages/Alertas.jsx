import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { productosApi } from "../api/endpoints";
import { mensajeError } from "../api/client";

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    productosApi
      .alertas()
      .then(setAlertas)
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div>
      <h1 className="font-display font-semibold text-xl mb-1">Alertas de stock mínimo</h1>
      <p className="text-text-muted text-sm mb-5">
        Corresponde a GET /api/productos/alertas — productos con stock_actual ≤ stock_minimo
      </p>

      {cargando ? (
        <div className="flex items-center gap-2 text-text-muted text-sm">
          <Loader2 className="animate-spin" size={16} /> Cargando alertas...
        </div>
      ) : error ? (
        <p className="text-danger bg-danger-bg border border-danger/30 rounded-lg px-4 py-3 text-sm">{error}</p>
      ) : alertas.length === 0 ? (
        <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-6 flex flex-col items-center text-center gap-2">
          <CheckCircle2 className="text-success" size={22} />
          <p className="text-sm text-success">Todo el inventario está por encima de su stock mínimo.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {alertas.map((p) => {
            const agotado = p.stock_actual <= 0;
            return (
              <Link
                key={p.id}
                to={`/productos/${p.id}`}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors hover:brightness-110 ${
                  agotado ? "bg-danger-bg border-danger/30" : "bg-warning-bg border-warning/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={17} className={agotado ? "text-danger" : "text-warning"} />
                  <div>
                    <p className="text-sm font-medium">{p.nombre}</p>
                    <p className="text-[11px] text-text-muted font-mono">{p.sku}</p>
                  </div>
                </div>
                <span className={`font-mono text-xs ${agotado ? "text-danger" : "text-warning"}`}>
                  {p.stock_actual} de {p.stock_minimo} mínimo
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
