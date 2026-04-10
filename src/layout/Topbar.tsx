interface TopbarProps {
  title: string;
  onNotifClick: () => void;
}

export default function Topbar({ title, onNotifClick }: TopbarProps) {
  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="notif-btn" onClick={onNotifClick}>
        <span style={{ fontSize: 14 }}>🔔</span>
        <div className="notif-dot" />
      </div>
      <div className="avatar">MA</div>
    </div>
  );
}