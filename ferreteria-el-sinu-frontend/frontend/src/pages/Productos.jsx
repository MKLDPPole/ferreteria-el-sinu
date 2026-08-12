import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { productosApi } from "../api/endpoints";
import { mensajeError } from "../api/client";
import StockHealthBar from "../components/StockHealthBar";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      setProductos(await productosApi.listar());
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setCargando(false);
    }
  }

  const filtrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <h1 className="font-display font-semibold text-xl mb-1">Productos</h1>
      <p className="text-text-muted text-sm mb-5">{productos.length} SKU activos en catálogo</p>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por SKU o nombre..."
          className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-accent transition-colors"
        />
      </div>

      {cargando ? (
        <div className="flex items-center gap-2 text-text-muted text-sm">
          <Loader2 className="animate-spin" size={16} /> Cargando productos...
        </div>
      ) : error ? (
        <p className="text-danger bg-danger-bg border border-danger/30 rounded-lg px-4 py-3 text-sm">{error}</p>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {filtrados.map((p) => (
            <Link
              key={p.id}
              to={`/productos/${p.id}`}
              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-surface-hover transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.nombre}</p>
                <p className="text-[11px] text-text-muted font-mono">{p.sku}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-mono text-sm text-text-muted">
                  {p.stock_actual} {p.unidad_medida}
                </span>
                <StockHealthBar actual={p.stock_actual} minimo={p.stock_minimo} />
              </div>
            </Link>
          ))}
          {filtrados.length === 0 && (
            <p className="text-text-muted text-sm px-4 py-6 text-center">No se encontraron productos.</p>
          )}
        </div>
      )}
    </div>
  );
}
