export default function Dashboard() {
  return (
    <div> 
      {/* tricas */}
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Tareas totales</div>
          <div className="metric-value">12</div>
          <div className="metric-sub">Curso actual</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Pendientes</div>
          <div className="metric-value" style={{ color: "#BA7517" }}>4</div>
          <div className="metric-sub">2 próximas a vencer</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Entregadas</div>
          <div className="metric-value" style={{ color: "#3B6D11" }}>7</div>
          <div className="metric-sub">1 sin calificar</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Promedio</div>
          <div className="metric-value" style={{ color: "#534AB7" }}>87</div>
          <div className="metric-sub">Sobre 100 pts</div>
        </div>
      </div>

      <div className="two-col">
        {/* Tareas recientes */}
        <div className="card">
          <div className="section-title">Tareas recientes</div>

          <div className="task-item">
            <div className="task-dot" style={{ background: "#EF9F27" }} />
            <div>
              <div className="task-name">Ensayo — Revolución Industrial</div>
              <div className="task-meta">Historia · Vence 12 abr</div>
              <span className="badge badge-pending">Pendiente</span>
            </div>
          </div>

          <div className="task-item">
            <div className="task-dot" style={{ background: "#639922" }} />
            <div>
              <div className="task-name">Lab de Química — Reacciones</div>
              <div className="task-meta">Química · Entregada 6 abr</div>
              <span className="badge badge-graded">Calificada: 92/100</span>
            </div>
          </div>

          <div className="task-item">
            <div className="task-dot" style={{ background: "#EF9F27" }} />
            <div>
              <div className="task-name">Mapa conceptual — Ecosistemas</div>
              <div className="task-meta">Biología · Vence 15 abr</div>
              <span className="badge badge-pending">Pendiente</span>
            </div>
          </div>

          <div className="task-item">
            <div className="task-dot" style={{ background: "#639922" }} />
            <div>
              <div className="task-name">Ejercicios — Funciones</div>
              <div className="task-meta">Matemáticas · Entregada 3 abr</div>
              <span className="badge badge-delivered">Entregada</span>
            </div>
          </div>
        </div>

        {/* Notificaciones recientes */}
        <div className="card">
          <div className="section-title">Notificaciones recientes</div>
          <div className="notif-list">
            <div className="notif-entry notif-unread">
              <div className="notif-icon" style={{ background: "#EEEDFE", fontSize: 14 }}>📋</div>
              <div>
                <div className="notif-text">Nueva tarea publicada: &quot;Proyecto Final — Física&quot;</div>
                <div className="notif-time">Hace 30 min · Física</div>
              </div>
            </div>
            <div className="notif-entry notif-unread">
              <div className="notif-icon" style={{ background: "#EAF3DE", fontSize: 14 }}>✓</div>
              <div>
                <div className="notif-text">Tu ensayo de Historia fue calificado</div>
                <div className="notif-time">Hace 2 horas · Historia</div>
              </div>
            </div>
            <div className="notif-entry notif-unread">
              <div className="notif-icon" style={{ background: "#FAEEDA", fontSize: 14 }}>⚡</div>
              <div>
                <div className="notif-text">Recordatorio: Mapa conceptual vence en 6 días</div>
                <div className="notif-time">Hace 4 horas · Biología</div>
              </div>
            </div>
            <div className="notif-entry">
              <div className="notif-icon" style={{ background: "#E1F5EE", fontSize: 14 }}>💬</div>
              <div>
                <div className="notif-text">El profesor comentó en tu entrega de Química</div>
                <div className="notif-time">Ayer · Química</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progreso del curso */}
      <div className="card">
        <div className="section-title">Progreso del curso</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-text-secondary)" }}>
              <span>Historia</span><span>75%</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: "75%" }} /></div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-text-secondary)" }}>
              <span>Química</span><span>90%</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: "90%", background: "#1D9E75" }} /></div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-text-secondary)" }}>
              <span>Matemáticas</span><span>60%</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: "60%", background: "#BA7517" }} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}