"use client";

import { useEffect, useState, useCallback } from "react";

interface EntregaDB {
  id_entrega: number;
  id_tarea: number;
  estado: string;
  fecha_entrega: string | null;
  calificacion: number | null;
  comentarios: string | null;
  titulo_tarea: string;
  fecha_limite: string;
}

interface Props {
  id_estudiante: number;
}

export default function Calificaciones({ id_estudiante }: Props) {
  const [entregas, setEntregas] = useState<EntregaDB[]>([]);
  const [cargando, setCargando] = useState(true);
  const [feedbackEntry, setFeedbackEntry] = useState<EntregaDB | null>(null);

  // US4 - Task Leo: consulta a BD para extraer nota y comentarios del estudiante autenticado
  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`/api/entregas?id_estudiante=${id_estudiante}`);
      const data = await res.json();
      if (data.ok) setEntregas(data.entregas);
    } finally {
      setCargando(false);
    }
  }, [id_estudiante]);

  useEffect(() => { cargar(); }, [cargar]);

  const calificadas = entregas.filter((e) => e.calificacion !== null);
  const promedio = calificadas.length > 0
    ? Math.round(calificadas.reduce((s, e) => s + (e.calificacion ?? 0), 0) / calificadas.length)
    : null;
  const notaMax = calificadas.length > 0
    ? Math.max(...calificadas.map((e) => e.calificacion ?? 0))
    : null;
  const porCalificar = entregas.filter((e) => ["Entregada", "Con_retraso"].includes(e.estado) && e.calificacion === null).length;

  const formatFecha = (f: string | null) => {
    if (!f) return "—";
    return new Date(f).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  };

  const estrellas = (nota: number) => Math.round((nota / 100) * 5);

  // US4 - Task Nicole: interfaz de visualización del historial de calificaciones con panel de feedback
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>Mis calificaciones</div>
      </div>

      {cargando && <div className="task-meta" style={{ color: "#534AB7", padding: 16 }}>⏳ Cargando calificaciones…</div>}

      {!cargando && (
        <>
          <div className="metrics-grid" style={{ marginBottom: 20 }}>
            <div className="metric-card">
              <div className="metric-label">Promedio general</div>
              <div className="metric-value" style={{ color: "#534AB7" }}>{promedio ?? "—"}</div>
              <div className="metric-sub">Sobre 100 pts</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Tareas calificadas</div>
              <div className="metric-value">{calificadas.length}</div>
              <div className="metric-sub">De {entregas.length} asignadas</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Nota más alta</div>
              <div className="metric-value" style={{ color: "#3B6D11" }}>{notaMax ?? "—"}</div>
              <div className="metric-sub">Este período</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Por calificar</div>
              <div className="metric-value" style={{ color: "#BA7517" }}>{porCalificar}</div>
              <div className="metric-sub">En revisión</div>
            </div>
          </div>

          {entregas.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--color-text-secondary)" }}>
              Aún no tienes tareas asignadas.
            </div>
          ) : (
            <div className="card">
              <table className="grade-table">
                <thead>
                  <tr>
                    <th>Tarea</th><th>Entregada</th><th>Fecha límite</th><th>Puntos</th><th>Estado</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {entregas.map((e) => (
                    <tr key={e.id_entrega}>
                      <td style={{ fontWeight: 500 }}>{e.titulo_tarea}</td>
                      <td style={{ color: "var(--color-text-secondary)" }}>{formatFecha(e.fecha_entrega)}</td>
                      <td style={{ color: "var(--color-text-secondary)" }}>{formatFecha(e.fecha_limite)}</td>
                      <td>
                        {e.calificacion !== null ? (
                          <div className="grade-circle" style={{
                            background: e.calificacion >= 75 ? "#EAF3DE" : "#FAEEDA",
                            color: e.calificacion >= 75 ? "#3B6D11" : "#854F0B",
                          }}>
                            {e.calificacion}
                          </div>
                        ) : (
                          <div className="grade-circle" style={{ background: "var(--color-background-secondary)", color: "var(--color-text-secondary)" }}>—</div>
                        )}
                      </td>
                      <td>
                        {e.estado === "Calificada" && <span className="badge badge-graded">Calificada</span>}
                        {e.estado === "Entregada" && <span className="badge badge-delivered">En revisión</span>}
                        {e.estado === "Con_retraso" && <span className="badge badge-late">Con retraso</span>}
                        {e.estado === "Asignada" && <span className="badge badge-pending">Pendiente</span>}
                      </td>
                      <td>
                        {e.estado === "Calificada" ? (
                          <button className="btn btn-sm" onClick={() => setFeedbackEntry(e)}>
                            Ver feedback
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {feedbackEntry && (
            <div className="card" style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Retroalimentación del profesor</div>
                <button className="btn btn-sm" onClick={() => setFeedbackEntry(null)}>✕ Cerrar</button>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 12 }}>
                {feedbackEntry.titulo_tarea}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 28, fontWeight: 500, color: "#534AB7" }}>{feedbackEntry.calificacion}</div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Puntuación</div>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className={`star${i <= estrellas(feedbackEntry.calificacion ?? 0) ? " active" : ""}`}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="feedback-box">
                <div className="feedback-label">Comentario del profesor</div>
                <div className="feedback-text">
                  {feedbackEntry.comentarios ?? "Sin comentarios adicionales."}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
