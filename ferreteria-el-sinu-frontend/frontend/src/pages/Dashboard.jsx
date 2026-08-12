import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowDownCircle, ArrowUpCircle, AlertTriangle, Loader2 } from "lucide-react";
import { productosApi, movimientosApi } from "../api/endpoints";
import { mensajeError } from "../api/client";

export default function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    setError("");
    try {
      const [prods, alrt, movs] = await Promise.all([
        productosApi.listar(),
        productosApi.alertas(),
        movimientosApi.listar(),
      ]);
      setProductos(prods);
      setAlertas(alrt);
      setMovimientos(movs.slice(0, 5));
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center gap-2 text-text-muted text-sm">
        <Loader2 className="animate-spin" size={16} /> Cargando resumen de inventario...
      </div>
    );
  }

  if (error) {
    return <p className="text-danger bg-danger-bg border border-danger/30 rounded-lg px-4 py-3 text-sm">{error}</p>;
  }

  const entradasHoy = movimientos.filter((m) => m.tipo === "ENTRADA");
  const salidasHoy = movimientos.filter((m) => m.tipo === "SALIDA");
  const productoPorId = Object.fromEntries(productos.map((p) => [p.id, p]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-semibold text-xl">Resumen de inventario</h1>
          <p className="text-text-muted text-sm mt-1">Actualizado en tiempo real</p>
        </div>
        <Link
          to="/movimiento"
          className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-bg text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Nuevo movimiento
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <TarjetaStat label="Total SKU" valor={productos.length} />
        <TarjetaStat label="Entradas recientes" valor={`+${entradasHoy.reduce((s, m) => s + m.cantidad, 0)}`} tono="success" />
        <TarjetaStat label="Salidas recientes" valor={`-${salidasHoy.reduce((s, m) => s + m.cantidad, 0)}`} tono="danger" />
        <TarjetaStat label="Alertas de stock" valor={alertas.length} tono={alertas.length > 0 ? "warning" : undefined} />
      </div>

      {alertas.length > 0 && (
        <div className="bg-warning-bg border border-warning/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-warning font-medium text-sm mb-3">
            <AlertTriangle size={16} /> Productos bajo stock mínimo
          </div>
          <div className="flex flex-col gap-2">
            {alertas.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{p.nombre}</span>
                  <span className="text-text-muted font-mono text-xs ml-2">{p.sku}</span>
                </div>
                <span className="font-mono text-xs text-text-muted">
                  {p.stock_actual} und / mín {p.stock_minimo}
                </span>
              </div>
            ))}
          </div>
          <Link to="/alertas" className="text-warning text-xs font-medium mt-3 inline-block hover:underline">
            Ver todas las alertas →
          </Link>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-text-muted mb-3">Últimos movimientos</h2>
        <div className="bg-surface border border-border rounded-xl divide-y divide-border">
          {movimientos.length === 0 && (
            <p className="text-text-muted text-sm px-4 py-6 text-center">
              Aún no hay movimientos registrados. Registra el primero desde "Nuevo movimiento".
            </p>
          )}
          {movimientos.map((m) => {
            const producto = productoPorId[m.producto_id];
            const esEntrada = m.tipo === "ENTRADA";
            return (
              <div key={m.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  {esEntrada ? (
                    <ArrowDownCircle className="text-success" size={18} />
                  ) : (
                    <ArrowUpCircle className="text-danger" size={18} />
                  )}
                  <div>
                    <p className="text-sm font-medium">{producto?.nombre || "Producto"}</p>
                    <p className="text-[11px] text-text-muted">
                      {m.tipo === "ENTRADA" ? "Entrada" : m.tipo === "SALIDA" ? "Salida" : "Ajuste"} ·{" "}
                      {new Date(m.fecha).toLocaleString("es-CO", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                    </p>
                  </div>
                </div>
                <span className={`font-mono text-sm ${esEntrada ? "text-success" : "text-danger"}`}>
                  {esEntrada ? "+" : "-"}
                  {m.cantidad}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TarjetaStat({ label, valor, tono }) {
  const colorTexto = tono === "success" ? "text-success" : tono === "danger" ? "text-danger" : tono === "warning" ? "text-warning" : "text-text";
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3">
      <p className="text-[11px] text-text-muted uppercase tracking-wide">{label}</p>
      <p className={`font-display font-semibold text-2xl mt-1 ${colorTexto}`}>{valor}</p>
    </div>
  );
}
