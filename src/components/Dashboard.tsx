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

          {tareas.map((t) => (
            <div className="task-item" key={t.id}>
              <div
                className="task-dot"
                style={{ background: "#EF9F27" }}
              />
              <div>
                <div className="task-name">{t.titulo}</div>
                <div className="task-meta">
                  {t.curso} · Vence {t.fechaLimite}
                </div>
                <span className="badge badge-pending">
                  Pendiente
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* NOTIFICACIONES (SE QUEDA IGUAL) */}
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
                <div className="notif-text">
                  Nueva tarea publicada
                </div>
                <div className="notif-time">
                  Automático
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESO (LO DEJAMOS IGUAL) */}
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
              <div
                className="progress-fill"
                style={{ width: "75%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}