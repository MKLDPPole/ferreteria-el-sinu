import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Search } from "lucide-react";
import { productosApi, movimientosApi } from "../api/endpoints";
import { mensajeError } from "../api/client";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { valor: "ENTRADA", label: "Entrada" },
  { valor: "SALIDA", label: "Salida" },
  { valor: "AJUSTE", label: "Ajuste" },
];

export default function RegistrarMovimiento() {
  const { usuario } = useAuth();
  const [tipo, setTipo] = useState("SALIDA");
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [productoSel, setProductoSel] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (busqueda.trim().length >= 2) buscarProducto();
      else setResultados([]);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  async function buscarProducto() {
    setBuscando(true);
    try {
      const porSku = await productosApi.listar({ sku: busqueda });
      const porNombre = await productosApi.listar({ nombre: busqueda });
      const combinados = [...porSku, ...porNombre.filter((p) => !porSku.some((x) => x.id === p.id))];
      setResultados(combinados.slice(0, 6));
    } catch {
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  }

  function seleccionarProducto(p) {
    setProductoSel(p);
    setBusqueda(`${p.sku} · ${p.nombre}`);
    setResultados([]);
    setExito(null);
    setError("");
  }

  const cantidadNum = Number(cantidad) || 0;
  let stockResultante = null;
  if (productoSel && cantidadNum > 0) {
    if (tipo === "ENTRADA") stockResultante = productoSel.stock_actual + cantidadNum;
    else if (tipo === "SALIDA") stockResultante = productoSel.stock_actual - cantidadNum;
    else stockResultante = cantidadNum;
  }
  const quedaBajoMinimo = stockResultante !== null && productoSel && stockResultante <= productoSel.stock_minimo;
  const dejaNegativo = stockResultante !== null && stockResultante < 0;

  async function manejarEnvio(e) {
    e.preventDefault();
    if (!productoSel || cantidadNum <= 0) return;
    setEnviando(true);
    setError("");
    setExito(null);
    try {
      const resultado = await movimientosApi.registrar({
        producto_id: productoSel.id,
        usuario_id: usuario.id,
        tipo,
        cantidad: cantidadNum,
      });
      setExito(resultado);
      setProductoSel({ ...productoSel, stock_actual: resultado.stock_resultante });
      setCantidad("");
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display font-semibold text-xl mb-1">Registrar movimiento</h1>
      <p className="text-text-muted text-sm mb-6">Busca el producto por SKU o nombre, y confirma la cantidad.</p>

      <div className="flex bg-surface border border-border rounded-lg p-1 mb-5 w-fit">
        {TABS.map((t) => (
          <button
            key={t.valor}
            onClick={() => {
              setTipo(t.valor);
              setExito(null);
            }}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              tipo === t.valor ? "bg-accent text-bg font-medium" : "text-text-muted hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={manejarEnvio} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="relative">
          <label className="text-xs text-text-muted mb-1.5 block">Buscar producto</label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setProductoSel(null);
                setExito(null);
              }}
              placeholder="SKU-042 o Tornillo 5mm..."
              required
              className="w-full bg-bg border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-accent transition-colors font-mono"
            />
            {buscando && <Loader2 size={15} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />}
          </div>

          {resultados.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full bg-surface border border-border rounded-lg overflow-hidden shadow-lg">
              {resultados.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => seleccionarProducto(p)}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-surface-hover flex justify-between items-center border-b border-border last:border-0"
                >
                  <span>
                    <span className="font-mono text-accent text-xs mr-2">{p.sku}</span>
                    {p.nombre}
                  </span>
                  <span className="text-text-muted text-xs font-mono">{p.stock_actual} und</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {productoSel && (
          <div className="flex justify-between text-sm bg-bg border border-border rounded-lg px-3 py-2.5">
            <span className="text-text-muted">Stock actual</span>
            <span className="font-mono font-medium">
              {productoSel.stock_actual} {productoSel.unidad_medida}
            </span>
          </div>
        )}

        <div>
          <label className="text-xs text-text-muted mb-1.5 block">
            {tipo === "AJUSTE" ? "Nuevo stock (valor absoluto)" : "Cantidad"}
          </label>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            required
            className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors font-mono"
          />
        </div>

        {stockResultante !== null && (
          <div
            className={`text-sm rounded-lg px-3 py-2.5 border flex items-center gap-2 ${
              dejaNegativo
                ? "bg-danger-bg border-danger/30 text-danger"
                : quedaBajoMinimo
                ? "bg-warning-bg border-warning/30 text-warning"
                : "bg-success/10 border-success/30 text-success"
            }`}
          >
            <AlertTriangle size={15} className="shrink-0" />
            <span>
              {dejaNegativo
                ? `No es posible: dejaría el stock en ${stockResultante} unidades.`
                : quedaBajoMinimo
                ? `Stock resultante: ${stockResultante} unidades. Por debajo del mínimo (${productoSel.stock_minimo}).`
                : `Stock resultante: ${stockResultante} unidades.`}
            </span>
          </div>
        )}

        {error && (
          <p className="text-danger text-xs bg-danger-bg border border-danger/30 rounded-lg px-3 py-2">{error}</p>
        )}

        {exito && (
          <p className="text-success text-xs bg-success/10 border border-success/30 rounded-lg px-3 py-2 flex items-center gap-2">
            <CheckCircle2 size={14} />
            Movimiento registrado. Stock resultante: {exito.stock_resultante} unidades.
            {exito.alerta_generada && " ⚠ Quedó en alerta de stock mínimo."}
          </p>
        )}

        <button
          type="submit"
          disabled={!productoSel || cantidadNum <= 0 || dejaNegativo || enviando}
          className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-bg font-medium text-sm rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
        >
          {enviando && <Loader2 size={15} className="animate-spin" />}
          Registrar {tipo === "ENTRADA" ? "entrada" : tipo === "SALIDA" ? "salida" : "ajuste"}
        </button>
      </form>
    </div>
  );
}
