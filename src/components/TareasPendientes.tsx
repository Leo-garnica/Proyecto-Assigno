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

export default function TareasPendientes({
  onNavigate,
  tareas,
}: TareasPendientesProps) {

  const tareasPendientes = tareas.filter(
    (t) => t.estado === "Asignada" || t.estado === "Sin entregar"
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>
          Tareas pendientes
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>

        {tareasPendientes.length === 0 && (
          <div className="task-meta">No hay tareas pendientes</div>
        )}

        {tareasPendientes.map((t) => (
          <div
            key={t.id}
            className="card"
            style={{
              borderLeft: "3px solid #EF9F27",
              borderRadius:
                "0 var(--border-radius-lg) var(--border-radius-lg) 0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div className="task-name">{t.titulo}</div>

                <div className="task-meta">
                  {t.curso} · {t.fechaLimite}
                </div>

                <span className="badge badge-pending">
                  Pendiente
                </span>
              </div>

              <button
                className="btn btn-sm"
                onClick={() =>
                  onNavigate(
                    t.tipoEntrega.includes("Enlace")
                      ? "entrega-enlace"
                      : "entrega-archivo"
                  )
                }
              >
                Entregar
              </button>
            </div>

            <div
              style={{
                fontSize: 12,
                marginTop: 10,
                paddingTop: 10,
                borderTop: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              {t.descripcion}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}