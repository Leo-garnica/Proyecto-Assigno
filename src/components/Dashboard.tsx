interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  curso: string;
  fechaLimite: string;
}

interface Props {
  tareas: Tarea[];
}

function esFechaExpirada(fechaLimite: string): boolean {
  if (!fechaLimite) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date(fechaLimite);
  limite.setHours(0, 0, 0, 0);
  return limite < hoy;
}

export default function Dashboard({ tareas }: Props) {
  return (
    <div>
      {/* MÉTRICAS */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Tareas totales</div>
          <div className="metric-value">{tareas.length}</div>
          <div className="metric-sub">Curso actual</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Pendientes</div>
          <div className="metric-value" style={{ color: "#BA7517" }}>
            {tareas.length}
          </div>
          <div className="metric-sub">Recientes</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Entregadas</div>
          <div className="metric-value" style={{ color: "#3B6D11" }}>
            0
          </div>
          <div className="metric-sub">Sin implementar aún</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Promedio</div>
          <div className="metric-value" style={{ color: "#534AB7" }}>
            0
          </div>
          <div className="metric-sub">Pendiente</div>
        </div>
      </div>

      <div className="two-col">
        {/* TAREAS DINÁMICAS */}
        <div className="card">
          <div className="section-title">Tareas recientes</div>

          {tareas.length === 0 && (
            <div className="task-meta">No hay tareas aún</div>
          )}

          {tareas.map((t) => {
            const expirada = esFechaExpirada(t.fechaLimite);

            return (
              <div className="task-item" key={t.id}>
                <div
                  className="task-dot"
                  style={{ background: expirada ? "#D93025" : "#EF9F27" }}
                />
                <div>
                  <div className="task-name">{t.titulo}</div>

                  <div
                    className="task-meta"
                    style={{ color: expirada ? "#D93025" : undefined }}
                  >
                    {t.curso} · Vence {t.fechaLimite}
                    {expirada && " — Expirada"}
                  </div>

                  {expirada ? (
                    <span
                      className="badge"
                      style={{ background: "#FCEBEB", color: "#A32D2D" }}
                    >
                      Vencida
                    </span>
                  ) : (
                    <span className="badge badge-pending">Pendiente</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* NOTIFICACIONES */}
        <div className="card">
          <div className="section-title">Notificaciones recientes</div>

          <div className="notif-list">
            <div className="notif-entry notif-unread">
              <div
                className="notif-icon"
                style={{ background: "#EEEDFE", fontSize: 14 }}
              >
                📋
              </div>
              <div>
                <div className="notif-text">Nueva tarea publicada</div>
                <div className="notif-time">Automático</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESO */}
      <div className="card">
        <div className="section-title">Progreso del curso</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "var(--color-text-secondary)",
              }}
            >
              <span>Historia</span>
              <span>75%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "75%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}