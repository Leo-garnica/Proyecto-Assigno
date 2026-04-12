"use client";

import { useState } from "react";
import { Tarea } from "@/app/page";
import NuevaTarea from "@/components/us1-nueva-tarea/NuevaTarea";
import CalificacionDocente from "@/components/us2-calificacion-retroalimentacion/CalificacionDocente";
import Notificaciones from "@/components/us5-notificacion-nueva-tarea/Notificaciones";
import Toast from "@/components/shared/Toast";

type ViewDocente = "dashboard" | "nueva-tarea" | "calificacion" | "notificaciones";

const titulos: Record<ViewDocente, string> = {
  dashboard: "Panel del Docente",
  "nueva-tarea": "Crear nueva tarea",
  calificacion: "Calificar entregas",
  notificaciones: "Notificaciones",
};

interface Props {
  id_usuario: number;
  nombre: string;
  correo: string;
  onToggleRol: () => void;
  rolActual: "Docente" | "Estudiante";
  initialTareas: Tarea[];
  initialNotificaciones: string[];
  onTareasChange: (tareas: Tarea[]) => void;
  onNotificacionesChange: (notif: string[]) => void;
}

export default function DashboardDocente({
  id_usuario, nombre, correo, onToggleRol, rolActual,
  initialTareas, initialNotificaciones, onTareasChange, onNotificacionesChange,
}: Props) {
  const [activeView, setActiveView] = useState<ViewDocente>("dashboard");
  const [toast, setToast] = useState<string | null>(null);
  const [tareas, setTareas] = useState<Tarea[]>(initialTareas);
  const [notificaciones, setNotificaciones] = useState<string[]>(initialNotificaciones);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const agregarTarea = (tarea: Tarea) => {
    const nuevasTareas = [tarea, ...tareas];
    const nuevasNotif = [`Nueva tarea publicada: ${tarea.titulo}`, ...notificaciones];
    setTareas(nuevasTareas); setNotificaciones(nuevasNotif);
    onTareasChange(nuevasTareas); onNotificacionesChange(nuevasNotif);
    if (tarea.notificar) showToast(`📧 Notificación enviada a estudiantes — ${tarea.titulo}`);
  };

  const initials = correo.slice(0, 2).toUpperCase();

  const navItems: { id: ViewDocente; icon: string; label: string; badge?: number }[] = [
    { id: "dashboard", icon: "⊞", label: "Inicio" },
    { id: "nueva-tarea", icon: "✚", label: "Nueva tarea" },
    { id: "calificacion", icon: "★", label: "Calificar entregas" },
    { id: "notificaciones", icon: "◉", label: "Notificaciones", badge: notificaciones.length || undefined },
  ];

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">A<span style={{ color: "#534AB7" }}>ssigno</span></div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>Panel Docente</div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div key={item.id} className={`nav-item${activeView === item.id ? " active" : ""}`} onClick={() => setActiveView(item.id)}>
              <div className="icon">{item.icon}</div>
              {item.label}
              {item.badge !== undefined && item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div className="avatar">{initials}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{nombre}</div>
              <div style={{ fontSize: 11, color: "#534AB7", fontWeight: 500 }}>Docente</div>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 12, padding: "6px 0" }} onClick={onToggleRol}>
            {rolActual === "Docente" ? "👤 Ver como Estudiante" : "🎓 Ver como Docente"}
          </button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{titulos[activeView]}</div>
          <div className="notif-btn" onClick={() => setActiveView("notificaciones")}>
            <span style={{ fontSize: 14 }}>🔔</span>
            {notificaciones.length > 0 && <div className="notif-dot" />}
          </div>
          <div className="avatar">{initials}</div>
        </div>

        <div className="content">
          {activeView === "dashboard" && (
            <div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-label">Tareas creadas</div>
                  <div className="metric-value">{tareas.length}</div>
                  <div className="metric-sub">Este período</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Estudiantes inscritos</div>
                  <div className="metric-value" style={{ color: "#534AB7" }}>—</div>
                  <div className="metric-sub">Activos</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Notificaciones</div>
                  <div className="metric-value" style={{ color: "#BA7517" }}>{notificaciones.length}</div>
                  <div className="metric-sub">Generadas</div>
                </div>
              </div>
              <div className="two-col">
                <div className="card">
                  <div className="section-title">Tareas publicadas</div>
                  {tareas.length === 0 && <div className="task-meta">No has creado tareas aún.</div>}
                  {tareas.map((t) => (
                    <div className="task-item" key={t.id}>
                      <div className="task-dot" style={{ background: "#534AB7" }} />
                      <div>
                        <div className="task-name">{t.titulo}</div>
                        <div className="task-meta">{t.curso} · Vence {t.fechaLimite}</div>
                        <span className="badge badge-pending">Asignada</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="section-title">Actividad reciente</div>
                  <div className="notif-list">
                    {notificaciones.length === 0 && <div className="task-meta">Sin actividad reciente.</div>}
                    {notificaciones.slice(0, 4).map((n, i) => (
                      <div key={i} className="notif-entry notif-unread">
                        <div className="notif-icon" style={{ background: "#EEEDFE", fontSize: 14 }}>📋</div>
                        <div>
                          <div className="notif-text">{n}</div>
                          <div className="notif-time">Automático · ahora</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "nueva-tarea" && (
            <NuevaTarea id_docente={id_usuario} showToast={showToast} onCrear={agregarTarea} />
          )}

          {/* US2: CalificacionDocente real conectada a BD */}
          {activeView === "calificacion" && (
            <CalificacionDocente id_docente={id_usuario} showToast={showToast} />
          )}

          {activeView === "notificaciones" && (
            <Notificaciones showToast={showToast} notificaciones={notificaciones} />
          )}
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}
