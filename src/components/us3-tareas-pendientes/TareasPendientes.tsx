import { ViewId } from "@/app/page";

interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  curso: string;
  fechaLimite: string;
  tipoEntrega: string;
  estado: string;
}

interface TareasPendientesProps {
  onNavigate: (view: ViewId) => void;
  tareas: Tarea[];
}

// US3 - Task Brenda: lógica para mostrar texto en rojo si la fecha de entrega ha expirado
function esFechaExpirada(fechaLimite: string): boolean {
  if (!fechaLimite) return false;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const limite = new Date(fechaLimite); limite.setHours(0, 0, 0, 0);
  return limite < hoy;
}

export default function TareasPendientes({ onNavigate, tareas }: TareasPendientesProps) {
  // US3 - Task Reynaldo: consulta y filtra tareas con estado "Asignada" o "Sin entregar" desde BD (realizado en DashboardEstudiante)
  // US3 - Task Esteban: algoritmo que ordena mostrando primero la fecha límite más próxima
  const tareasPendientes = [...tareas]
    .filter((t) => t.estado === "Asignada" || t.estado === "Sin entregar")
    .sort((a, b) => new Date(a.fechaLimite).getTime() - new Date(b.fechaLimite).getTime());

  // US3 - Task Leo: interfaz gráfica de la lista de tareas pendientes
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>Tareas pendientes</div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          Ordenadas por fecha límite más próxima
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {tareasPendientes.length === 0 && (
          <div className="task-meta">No hay tareas pendientes ✅</div>
        )}

        {tareasPendientes.map((t) => {
          const expirada = esFechaExpirada(t.fechaLimite);
          return (
            <div
              key={t.id}
              className="card"
              style={{
                borderLeft: `3px solid ${expirada ? "#D93025" : "#EF9F27"}`,
                borderRadius: "0 var(--border-radius-lg) var(--border-radius-lg) 0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div className="task-name">{t.titulo}</div>
                  <div className="task-meta" style={{ color: expirada ? "#D93025" : undefined }}>
                    {t.curso} · {t.fechaLimite}
                    {expirada && " — Fecha expirada"}
                  </div>
                  {expirada ? (
                    <span className="badge" style={{ background: "#FCEBEB", color: "#A32D2D" }}>Vencida</span>
                  ) : (
                    <span className="badge badge-pending">Pendiente</span>
                  )}
                </div>
                <button
                  className="btn btn-sm"
                  onClick={() => onNavigate(t.tipoEntrega?.includes("Enlace") ? "entrega-enlace" : "entrega-archivo")}
                >
                  Entregar
                </button>
              </div>
              <div style={{ fontSize: 12, marginTop: 10, paddingTop: 10, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                {t.descripcion}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
