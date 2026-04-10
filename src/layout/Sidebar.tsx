import { ViewId } from "@/app/page";

interface SidebarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

const navItems: { id: ViewId; icon: string; label: string; badge?: number }[] = [
  { id: "dashboard",       icon: "⊞", label: "Inicio" },
  { id: "nueva-tarea",     icon: "✚", label: "Nueva tarea" },
  { id: "pendientes",      icon: "◷", label: "Tareas pendientes", badge: 4 },
  { id: "calificaciones",  icon: "★", label: "Calificaciones" },
  { id: "entrega-archivo", icon: "↑", label: "Entregar archivo" },
  { id: "entrega-enlace",  icon: "⊘", label: "Entregar enlace" },
  { id: "vista-previa",    icon: "▣", label: "Vista previa" },
  { id: "notificaciones",  icon: "◉", label: "Notificaciones", badge: 3 },
];

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          Assigno
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>
          Gestión de tareas
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item${activeView === item.id ? " active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <div className="icon">{item.icon}</div>
            {item.label}
            {item.badge !== undefined && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </div>
        ))}
      </nav>

      <div style={{ padding: "12px 16px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="avatar">MA</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>
              María Aguilar
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Estudiante</div>
          </div>
        </div>
      </div>
    </div>
  );
}