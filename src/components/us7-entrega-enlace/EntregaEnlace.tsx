"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

interface EntregaEnlaceProps {
  id_estudiante: number;
  showToast: (msg: string) => void;
}

interface TareaEntrega {
  id_tarea: number;
  id_entrega: number;
  titulo: string;
  fecha_limite: string;
  estado: string;
}

interface EntregaInfo {
  fechaEntrega: string;
  estado: string;
}

function esFechaExpirada(fechaLimite: string): boolean {
  if (!fechaLimite) return false;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const limite = new Date(fechaLimite); limite.setHours(0, 0, 0, 0);
  return limite < hoy;
}

export default function EntregaEnlace({ id_estudiante, showToast }: EntregaEnlaceProps) {
  const [tareas, setTareas] = useState<TareaEntrega[]>([]);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaEntrega | null>(null);
  const [url, setUrl] = useState("");
  const [comentario, setComentario] = useState("");
  const [entregaInfo, setEntregaInfo] = useState<EntregaInfo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [entregando, setEntregando] = useState(false);

  const cargarTareas = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`/api/entregas?id_estudiante=${id_estudiante}`);
      const data = await res.json();
      if (data.ok) {
        const pendientes: TareaEntrega[] = data.entregas
          .filter((e: { estado: string }) => ["Asignada", "Sin_entregar"].includes(e.estado))
          .map((e: { id_tarea: number; id_entrega: number; titulo_tarea: string; fecha_limite: string; estado: string }) => ({
            id_tarea: e.id_tarea,
            id_entrega: e.id_entrega,
            titulo: e.titulo_tarea,
            fecha_limite: e.fecha_limite,
            estado: e.estado,
          }));
        setTareas(pendientes);
        if (pendientes.length > 0) setTareaSeleccionada(pendientes[0]);
      }
    } finally {
      setCargando(false);
    }
  }, [id_estudiante]);

  useEffect(() => { cargarTareas(); }, [cargarTareas]);

  const expirada = tareaSeleccionada ? esFechaExpirada(tareaSeleccionada.fecha_limite) : false;

  // US7 - Task Brenda: validación mediante expresiones regulares para confirmar que la URL sea válida
  const esUrlValida = useMemo(() => {
    try {
      const valor = url.trim();
      if (!valor) return false;
      const urlObj = new URL(valor);
      const protocoloValido = urlObj.protocol === "http:" || urlObj.protocol === "https:";
      const hostValido = ["github.com", "gitlab.com", "bitbucket.org"].includes(urlObj.hostname);
      return protocoloValido && hostValido;
    } catch { return false; }
  }, [url]);

  // US7 - Task Reinaldo: habilita el botón "Entregar" solo tras validación exitosa de la URL
  // US7 - Task Nicole: inserta el enlace en BD y cambia estado a "Entregado" vía POST /api/entregas
  const handleEntregar = async () => {
    if (!tareaSeleccionada) { showToast("Selecciona una tarea."); return; }
    if (!esUrlValida) { showToast("Ingresa un enlace válido de GitHub, GitLab o Bitbucket."); return; }

    setEntregando(true);
    try {
      const formData = new FormData();
      formData.append("id_entrega", String(tareaSeleccionada.id_entrega));
      formData.append("tipo", "enlace");
      formData.append("url", url.trim());

      const res = await fetch("/api/entregas", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Error al entregar."); return; }

      setEntregaInfo({ fechaEntrega: new Date(data.fecha_entrega).toLocaleString(), estado: data.estado });
      showToast(data.estado === "Entregada" ? "✅ Enlace entregado a tiempo" : "⚠️ Enlace entregado con retraso");
      setUrl(""); setComentario("");
      setTareas((prev) => prev.filter((t) => t.id_entrega !== tareaSeleccionada.id_entrega));
      setTareaSeleccionada(null);
    } catch {
      showToast("Error de red al entregar.");
    } finally {
      setEntregando(false);
    }
  };

  // US7 - Task Esteban: interfaz para ingreso de URL y cuadro de advertencia de visibilidad del repositorio
  return (
    <div className="two-col" style={{ gridTemplateColumns: "1fr" }}>

      {cargando && <div className="task-meta" style={{ color: "#534AB7" }}>⏳ Cargando tareas…</div>}

      {!cargando && tareas.length === 0 && !entregaInfo && (
        <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--color-text-secondary)" }}>
          No tienes tareas pendientes de entrega. ✅
        </div>
      )}

      {!cargando && tareas.length > 0 && (
        <>
          <div className="card">
            <div className="section-title">Selecciona la tarea</div>
            <select
              className="form-input"
              value={tareaSeleccionada?.id_entrega ?? ""}
              onChange={(e) => {
                const t = tareas.find((x) => x.id_entrega === Number(e.target.value));
                setTareaSeleccionada(t ?? null);
                setEntregaInfo(null); setUrl("");
              }}
            >
              {tareas.map((t) => (
                <option key={t.id_entrega} value={t.id_entrega}>{t.titulo}</option>
              ))}
            </select>
            {tareaSeleccionada && (
              <p className="task-meta" style={{ fontSize: "12px", marginTop: 8, color: expirada ? "#D93025" : undefined }}>
                Fecha límite: {new Date(tareaSeleccionada.fecha_limite).toLocaleString()}
                {expirada && " — Expirada"}
              </p>
            )}
            <p className="task-meta" style={{ fontSize: "13px", marginTop: 8 }}>
              Envía la URL de tu repositorio con el código fuente. Asegúrate de que el repositorio sea público o que el docente tenga acceso.
            </p>
          </div>

          <div className="card">
            <div className="section-title">Enlace del repositorio</div>

            <div className="form-row">
              <label className="form-label">URL del repositorio</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/usuario/repositorio"
                className="form-input link-input"
              />
            </div>

            <div className="task-meta">Se aceptan repositorios de GitHub, GitLab o Bitbucket</div>
            <div style={{ marginTop: 8 }}>
              <span className="badge badge-graded">github.com</span>{" "}
              <span className="badge badge-graded">gitlab.com</span>{" "}
              <span className="badge badge-graded">bitbucket.org</span>
            </div>

            {url.trim() !== "" && (
              <div className="badge" style={{ marginTop: 10, background: esUrlValida ? "#EAF3DE" : "#FCEBEB", color: esUrlValida ? "#3B6D11" : "#A32D2D" }}>
                {esUrlValida ? "✅ Repositorio válido" : "❌ El enlace no es válido"}
              </div>
            )}

            <div className="form-row" style={{ marginTop: 16 }}>
              <label className="form-label">Comentario para el profesor (opcional)</label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Agrega una nota o aclaración sobre tu entrega..."
                className="form-input form-textarea"
              />
            </div>

            {esUrlValida && (
              <div style={{ marginTop: 10, padding: "8px 12px", background: "#FAEEDA", borderRadius: 6, fontSize: 12, color: "#854F0B" }}>
                ⚠️ Antes de entregar, asegúrate de que tu repositorio sea <strong>público</strong> o de que el docente tenga acceso.
              </div>
            )}

            {entregaInfo && (
              <div style={{
                marginTop: 14, padding: 12, borderRadius: 8,
                background: entregaInfo.estado === "Entregada" ? "#EAF3DE" : "#FCEBEB",
                color: entregaInfo.estado === "Entregada" ? "#3B6D11" : "#A32D2D",
                fontSize: 12, fontWeight: 500,
              }}>
                Estado: {entregaInfo.estado}<br />
                Fecha de entrega: {entregaInfo.fechaEntrega}
              </div>
            )}

            <div className="modal-footer">
              <button className="btn" onClick={() => { setUrl(""); setComentario(""); setEntregaInfo(null); }}>Cancelar</button>
              <button
                className={`btn btn-primary${!esUrlValida ? " btn-disabled" : ""}`}
                disabled={!esUrlValida || entregando}
                onClick={handleEntregar}
              >
                {entregando ? "Entregando…" : "Entregar"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
