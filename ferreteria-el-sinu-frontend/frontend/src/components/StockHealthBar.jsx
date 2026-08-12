/**
 * Muestra visualmente qué tan cerca está un producto de su stock mínimo.
 * No es solo un número: es la señal de "urgencia de un vistazo" que se pidió
 * en los criterios de usabilidad del Momento 2.
 */
export default function StockHealthBar({ actual, minimo }) {
  const ratio = minimo > 0 ? actual / minimo : actual > 0 ? 2 : 0;
  const porcentaje = Math.min(ratio * 50, 100); // 100% de la barra = 2x el mínimo

  let color = "bg-success";
  let estado = "Saludable";
  if (actual <= 0) {
    color = "bg-danger";
    estado = "Agotado";
  } else if (actual <= minimo) {
    color = "bg-danger";
    estado = "Bajo mínimo";
  } else if (actual <= minimo * 1.3) {
    color = "bg-warning";
    estado = "Ajustado";
  }

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      <span className="text-[11px] text-text-muted whitespace-nowrap font-mono">{estado}</span>
    </div>
  );
}
