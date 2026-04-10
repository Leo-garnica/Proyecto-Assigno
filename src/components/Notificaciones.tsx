interface NotificacionesProps {
  showToast: (msg: string) => void;
  notificaciones: string[];
}

export default function Notificaciones({
  showToast,
  notificaciones,
}: NotificacionesProps) {
  return (
    <div style={{ maxWidth: 600 }}>
      <div className="card">
        <div className="section-title">Notificaciones</div>

        {notificaciones.length === 0 && (
          <div className="task-meta">No hay notificaciones</div>
        )}

        {notificaciones.map((n, i) => (
          <div key={i} className="notif-entry">
            <div className="notif-text">{n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}