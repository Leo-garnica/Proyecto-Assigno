interface NotificacionesProps {
  showToast: (msg: string) => void;
}

export default function Notificaciones({ showToast }: NotificacionesProps) {
  return (
    <div>
      <h2>Notificaciones</h2>

      <div className="notif-entry">
        <p>Nueva tarea publicada</p>
      </div>
    </div>
  );
}