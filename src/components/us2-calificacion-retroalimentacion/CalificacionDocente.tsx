"use client";

import { useEffect, useState, useCallback } from "react";

interface Entrega {
  id_entrega: number;
  nombre_estudiante: string;
  titulo_tarea: string;
  fecha_entrega: string | null;
  estado: string;
  calificacion: number | null;
  comentarios: string | null;
  ruta_o_url: string | null;
  nombre_original: string | null;
  tipo_material: string | null;
}

interface Props {
  id_docente: number;
  showToast: (msg: string) => void;
}

export default function CalificacionDocente({ id_docente, showToast }: Props) {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<number | null>(null);
  const [nota, setNota] = useState("");
  const [comentario, setComentario] = useState("");
  const [notaError, setNotaError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // US2 - Task Leo: carga las entregas recibidas desde BD vía GET /api/entregas?id_docente
  const cargarEntregas = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`/api/entregas?id_docente=${id_docente}`);
      const data = await res.json();
      if (data.ok) setEntregas(data.entregas);
    } catch {
      showToast("Error al cargar las entregas");
    } finally {
      setCargando(false);
    }
  }, [id_docente, showToast]);

  useEffect(() => { cargarEntregas(); }, [cargarEntregas]);

  const abrirCalificar = (e: Entrega) => {
    setNota(e.calificacion !== null ? String(e.calificacion) : "");
    setComentario(e.comentarios ?? "");
    setNotaError(null);
    setEditando(e.id_entrega);
  };

  // US2 - Task Esteban: validación frontend del rango 0–100 antes de enviar al backend
  // US2 - Task Brenda: PATCH /api/entregas actualiza calificación, comentarios y estado "Calificada" en BD
  const guardarCalificacion = async () => {
    const n = Number(nota);
    if (nota === "" || isNaN(n)) { setNotaError("Ingresa un número válido."); return; }
    if (n < 0 || n > 100) { setNotaError("La calificación debe estar entre 0 y 100."); return; }

    setGuardando(true);
    try {
      const res = await fetch("/api/entregas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_entrega: editando, calificacion: n, comentarios: comentario || null }),
      });
      const data = await res.json();
      if (!res.ok) { setNotaError(data.error ?? "Error al guardar."); return; }
      showToast("✅ Calificación guardada — estado cambiado a Calificada");
      setEditando(null);
      setEntregas((prev) =>
        prev.map((e) =>
          e.id_entrega === editando
            ? { ...e, calificacion: n, comentarios: comentario || null, estado: "Calificada" }
            : e
        )
      );
    } catch {
      showToast("Error de red al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const formatFecha = (f: string | null) => {
    if (!f) return "—";
    return new Date(f).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  };

  // US2 - Task Nicole: interfaz de registro de calificación numérica y comentarios del docente
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>
        Entregas pendientes de calificación
      </div>

      <div style={{ marginBottom: 12, padding: "10px 14px", background: "#EEEDFE", borderRadius: "var(--border-radius-md)", fontSize: 12, color: "#534AB7" }}>
        Solo puedes calificar entregas con estado <strong>Entregada</strong> o <strong>Con retraso</strong>. La calificación debe ser un número entre 0 y 100.
      </div>

      {cargando && <div className="task-meta" style={{ color: "#534AB7", padding: 16 }}>⏳ Cargando entregas desde la base de datos…</div>}

      {!cargando && entregas.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--color-text-secondary)" }}>
          No hay entregas recibidas aún.
        </div>
      )}

      {!cargando && entregas.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <table className="grade-table">
            <thead>
              <tr>
                <th>Estudiante</th><th>Tarea</th><th>Entregada</th>
                <th>Estado</th><th>Nota</th><th>Material</th><th></th>
              </tr>
            </thead>
            <tbody>
              {entregas.map((e) => (
                <tr key={e.id_entrega}>
                  <td style={{ fontWeight: 500 }}>{e.nombre_estudiante}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{e.titulo_tarea}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{formatFecha(e.fecha_entrega)}</td>
                  <td>
                    {e.estado === "Calificada" && <span className="badge badge-graded">Calificada</span>}
                    {e.estado === "Entregada" && <span className="badge badge-delivered">Entregada</span>}
                    {e.estado === "Con_retraso" && <span className="badge badge-late">Con retraso</span>}
                  </td>
                  <td>
                    {e.calificacion !== null ? (
                      <div className="grade-circle" style={{ background: e.calificacion >= 75 ? "#EAF3DE" : "#FAEEDA", color: e.calificacion >= 75 ? "#3B6D11" : "#854F0B" }}>
                        {e.calificacion}
                      </div>
                    ) : (
                      <span style={{ color: "var(--color-text-tertiary)", fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td>
                    {e.ruta_o_url ? (
                      <a href={e.ruta_o_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#534AB7" }}>
                        {e.tipo_material === "Enlace" ? "🔗 Ver enlace" : `📄 ${e.nombre_original ?? "Ver archivo"}`}
                      </a>
                    ) : <span style={{ color: "var(--color-text-tertiary)", fontSize: 11 }}>—</span>}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => abrirCalificar(e)}
                      disabled={!["Entregada", "Con_retraso"].includes(e.estado)}
                      style={{ opacity: !["Entregada", "Con_retraso"].includes(e.estado) ? 0.4 : 1 }}
                    >
                      {e.calificacion !== null ? "Editar" : "Calificar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={`modal-overlay${editando !== null ? " open" : ""}`}>
        <div className="modal">
          <div className="modal-title">Registrar calificación y retroalimentación</div>
          <div style={{ marginBottom: 12, fontSize: 13, color: "var(--color-text-secondary)" }}>
            Asigna una nota entre <strong>0</strong> y <strong>100</strong>. Los comentarios son opcionales.
          </div>
          <div className="form-row">
            <label className="form-label">Calificación numérica (0 – 100)</label>
            <input
              className="form-input" type="number" min={0} max={100} placeholder="Ej. 87"
              value={nota}
              onChange={(e) => { setNota(e.target.value); setNotaError(null); }}
              style={{ borderColor: notaError ? "#E24B4A" : undefined }}
            />
            {notaError && <div style={{ fontSize: 11, color: "#E24B4A", marginTop: 4 }}>{notaError}</div>}
          </div>
          <div className="form-row">
            <label className="form-label">Comentarios para el estudiante (opcional)</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Retroalimentación directa sobre el desempeño..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={() => setEditando(null)} disabled={guardando}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardarCalificacion} disabled={guardando}>
              {guardando ? "Guardando…" : "Devolver y calificar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
