import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, RefreshCcw, Loader2 } from "lucide-react";
import { productosApi } from "../api/endpoints";
import { mensajeError } from "../api/client";
import StockHealthBar from "../components/StockHealthBar";

const ICONOS = { ENTRADA: ArrowDownCircle, SALIDA: ArrowUpCircle, AJUSTE: RefreshCcw };
const COLORES = { ENTRADA: "text-success", SALIDA: "text-danger", AJUSTE: "text-warning" };

export default function FichaProducto() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    productosApi
      .obtener(id)
      .then(setProducto)
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <div className="flex items-center gap-2 text-text-muted text-sm">
        <Loader2 className="animate-spin" size={16} /> Cargando producto...
      </div>
    );
  }
  if (error) return <p className="text-danger bg-danger-bg border border-danger/30 rounded-lg px-4 py-3 text-sm">{error}</p>;
  if (!producto) return null;

  return (
    <div className="max-w-xl">
      <Link to="/productos" className="flex items-center gap-1.5 text-text-muted text-sm mb-4 hover:text-text w-fit">
        <ArrowLeft size={15} /> Productos
      </Link>

      <p className="font-mono text-accent text-xs mb-1">{producto.sku}</p>
      <h1 className="font-display font-semibold text-xl mb-5">{producto.nombre}</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-xl px-4 py-3">
          <p className="text-[11px] text-text-muted uppercase">Stock actual</p>
          <p className="font-display font-semibold text-2xl mt-1">{producto.stock_actual}</p>
          <div className="mt-2">
            <StockHealthBar actual={producto.stock_actual} minimo={producto.stock_minimo} />
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl px-4 py-3">
          <p className="text-[11px] text-text-muted uppercase">Stock mínimo</p>
          <p className="font-display font-semibold text-2xl mt-1">{producto.stock_minimo}</p>
          <p className="text-[11px] text-text-muted mt-2">Unidad: {producto.unidad_medida}</p>
        </div>
      </div>

      <h2 className="text-sm font-medium text-text-muted mb-3">Historial de movimientos</h2>
      <div className="bg-surface border border-border rounded-xl divide-y divide-border">
        {producto.ultimos_movimientos.length === 0 && (
          <p className="text-text-muted text-sm px-4 py-6 text-center">Sin movimientos registrados aún.</p>
        )}
        {producto.ultimos_movimientos.map((m) => {
          const Icono = ICONOS[m.tipo];
          return (
            <div key={m.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Icono size={17} className={COLORES[m.tipo]} />
                <div>
                  <p className="text-sm">{m.tipo === "ENTRADA" ? "Entrada" : m.tipo === "SALIDA" ? "Salida" : "Ajuste"}</p>
                  <p className="text-[11px] text-text-muted">
                    {new Date(m.fecha).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <span className={`font-mono text-sm ${COLORES[m.tipo]}`}>
                {m.tipo === "ENTRADA" ? "+" : m.tipo === "SALIDA" ? "-" : ""}
                {m.cantidad}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
