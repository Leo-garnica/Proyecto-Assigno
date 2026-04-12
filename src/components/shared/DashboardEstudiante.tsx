"use client";

import { useEffect, useState } from "react";
import { Tarea, ViewId } from "@/app/page";
import TareasPendientes from "@/components/us3-tareas-pendientes/TareasPendientes";
import Calificaciones from "@/components/us4-ver-calificaciones/Calificaciones";
import EntregaArchivo from "@/components/us6-entrega-archivos/EntregaArchivo";
import EntregaEnlace from "@/components/us7-entrega-enlace/EntregaEnlace";
import VistaPrevia from "@/components/us8-vista-previa/VistaPrevia";
import Notificaciones from "@/components/us5-notificacion-nueva-tarea/Notificaciones";
import Toast from "@/components/shared/Toast";

type ViewEstudiante =
  | "dashboard" | "pendientes" | "calificaciones"
  | "entrega-archivo" | "entrega-enlace" | "vista-previa" | "notificaciones";

const titulos: Record<ViewEstudiante, string> = {
  dashboard: "Mi panel",
  pendientes: "Tareas pendientes",
  calificaciones: "Mis calificaciones",
  "entrega-archivo": "Entregar archivo",
  "entrega-enlace": "Entregar enlace",
  "vista-previa": "Vista previa de archivos",
  notificaciones: "Notificaciones",
};

interface Props {
  id_usuario: number;
  nombre: string;
  correo: string;
  onToggleRol: () => void;
  rolActual: "Docente" | "Estudiante";
  tareasDocente: Tarea[];
  notificacionesDocente: string[];
}

function esFechaExpirada(fechaLimite: string): boolean {
  if (!fechaLimite) return false;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const limite = new Date(fechaLimite); limite.setHours(0, 0, 0, 0);
  return limite < hoy;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function DashboardEstudiante({ id_usuario, nombre, correo, onToggleRol, rolActual, tareasDocente, notificacionesDocente }: Props) {
  const [activeView, setActiveView] = useState<ViewEstudiante>("dashboard");
  const [toast, setToast] = useState<string | null>(null);
  const [tareasDB, setTareasDB] = useState<Tarea[]>([]);
  const [cargandoTareas, setCargandoTareas] = useState(true);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  useEffect(() => {
    const cargarTareas = async () => {
      try {
        const res = await fetch(`/api/tareas?id_estudiante=${id_usuario}`);
        const data = await res.json();
        if (data.ok && Array.isArray(data.tareas)) {
          const tareasMapeadas: Tarea[] = data.tareas.map((t: {
            id_tarea: number; titulo: string; descripcion: string | null;
            fecha_limite: string; archivo_nombre: string | null;
            archivo_url: string | null; archivo_tamano: number | null; estado: string;
          }) => ({
            id: t.id_tarea, titulo: t.titulo, descripcion: t.descripcion ?? "",
            curso: "General", fechaLimite: t.fecha_limite?.split("T")[0] ?? "",
            puntosMaximos: 100, tipoEntrega: "Archivo (PDF, DOCX...)", notificar: false,
            permitirTardia: false, estado: t.estado,
            archivoNombre: t.archivo_nombre, archivoUrl: t.archivo_url, archivoTamano: t.archivo_tamano,
          }));
          setTareasDB(tareasMapeadas);
        }
      } catch { /* fallback a estado compartido */ }
      finally { setCargandoTareas(false); }
    };
    cargarTareas();
  }, [id_usuario]);

  const todasTareas = tareasDB.length > 0 ? tareasDB : tareasDocente;
  const tareasPendientes = [...todasTareas]
    .filter((t) => t.estado === "Asignada" || t.estado === "Sin entregar")
    .sort((a, b) => new Date(a.fechaLimite).getTime() - new Date(b.fechaLimite).getTime());

  const initials = correo.slice(0, 2).toUpperCase();

  const navItems: { id: ViewEstudiante; icon: string; label: string; badge?: number }[] = [
    { id: "dashboard", icon: "⊞", label: "Inicio" },
    { id: "pendientes", icon: "◷", label: "Tareas pendientes", badge: tareasPendientes.length || undefined },
    { id: "calificaciones", icon: "★", label: "Mis calificaciones" },
    { id: "entrega-archivo", icon: "↑", label: "Entregar archivo" },
    { id: "entrega-enlace", icon: "⊘", label: "Entregar enlace" },
    { id: "vista-previa", icon: "▣", label: "Vista previa" },
    { id: "notificaciones", icon: "◉", label: "Notificaciones", badge: notificacionesDocente.length || undefined },
  ];

  const navigate = (view: ViewId) => {
    if (view in titulos) setActiveView(view as ViewEstudiante);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">A<span style={{ color: "#534AB7" }}>ssigno</span></div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>Panel Estudiante</div>
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
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{correo.split("@")[0]}</div>
              <div style={{ fontSize: 11, color: "#534AB7", fontWeight: 500 }}>Estudiante</div>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 12, padding: "6px 0" }} onClick={onToggleRol}>
            {rolActual === "Estudiante" ? "🎓 Ver como Docente" : "👤 Ver como Estudiante"}
          </button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{titulos[activeView]}</div>
          <div className="notif-btn" onClick={() => setActiveView("notificaciones")}>
            <span style={{ fontSize: 14 }}>🔔</span>
            {notificacionesDocente.length > 0 && <div className="notif-dot" />}
          </div>
          <div className="avatar">{initials}</div>
        </div>

        <div className="content">
          {activeView === "dashboard" && (
            <div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-label">Tareas asignadas</div>
                  <div className="metric-value">{todasTareas.length}</div>
                  <div className="metric-sub">Total</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Pendientes</div>
                  <div className="metric-value" style={{ color: "#BA7517" }}>{tareasPendientes.length}</div>
                  <div className="metric-sub">Por entregar</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Entregadas</div>
                  <div className="metric-value" style={{ color: "#3B6D11" }}>
                    {todasTareas.filter((t) => t.estado === "Entregada" || t.estado === "Calificada").length}
                  </div>
                  <div className="metric-sub">Este período</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Con archivo</div>
                  <div className="metric-value" style={{ color: "#534AB7" }}>
                    {todasTareas.filter((t) => t.archivoUrl).length}
                  </div>
                  <div className="metric-sub">PDF adjunto</div>
                </div>
              </div>

              <div className="two-col">
                <div className="card">
                  <div className="section-title">Próximas entregas</div>
                  {cargandoTareas && <div className="task-meta" style={{ color: "#534AB7" }}>⏳ Cargando tareas…</div>}
                  {!cargandoTareas && tareasPendientes.length === 0 && (
                    <div className="task-meta">No tienes tareas pendientes. ✅</div>
                  )}
                  {tareasPendientes.slice(0, 4).map((t) => {
                    const expirada = esFechaExpirada(t.fechaLimite);
                    return (
                      <div className="task-item" key={t.id}>
                        <div className="task-dot" style={{ background: expirada ? "#D93025" : "#EF9F27" }} />
                        <div style={{ flex: 1 }}>
                          <div className="task-name">{t.titulo}</div>
                          <div className="task-meta" style={{ color: expirada ? "#D93025" : undefined }}>
                            {t.curso} · Vence {t.fechaLimite}{expirada && " — Expirada"}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                            {expirada ? <span className="badge badge-late">Vencida</span> : <span className="badge badge-pending">Pendiente</span>}
                            {t.archivoUrl && (
                              <a href={t.archivoUrl} target="_blank" rel="noopener noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#534AB7", fontWeight: 500, textDecoration: "none", background: "#EEEDFE", borderRadius: 4, padding: "2px 8px", border: "1px solid #C4C2F0" }}
                                title={`${t.archivoNombre ?? "Archivo"} · ${t.archivoTamano ? formatBytes(t.archivoTamano) : ""}`}
                              >📄 Ver PDF</a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {tareasPendientes.length > 0 && (
                    <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => setActiveView("pendientes")}>Ver todas →</button>
                  )}
                </div>
                <div className="card">
                  <div className="section-title">Notificaciones recientes</div>
                  <div className="notif-list">
                    {notificacionesDocente.length === 0 && <div className="task-meta">Sin notificaciones nuevas.</div>}
                    {notificacionesDocente.slice(0, 4).map((n, i) => (
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

          {activeView === "pendientes" && (
            <TareasPendientes onNavigate={navigate} tareas={todasTareas} />
          )}

          {/* US4: Calificaciones conectadas a BD con id_estudiante */}
          {activeView === "calificaciones" && (
            <Calificaciones id_estudiante={id_usuario} />
          )}

          {/* US6: EntregaArchivo conectada a BD */}
          {activeView === "entrega-archivo" && (
            <EntregaArchivo id_estudiante={id_usuario} showToast={showToast} />
          )}

          {/* US7: EntregaEnlace conectada a BD */}
          {activeView === "entrega-enlace" && (
            <EntregaEnlace id_estudiante={id_usuario} showToast={showToast} />
          )}

          {activeView === "vista-previa" && <VistaPrevia />}

          {activeView === "notificaciones" && (
            <Notificaciones showToast={showToast} notificaciones={notificacionesDocente} />
          )}
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}
