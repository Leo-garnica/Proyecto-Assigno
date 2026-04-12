"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface EntregaArchivoProps {
  id_estudiante: number;
  showToast: (msg: string) => void;
}

interface FileItem {
  id: number;
  file: File;
}

interface EntregaInfo {
  fechaEntrega: string;
  estado: string;
}

interface TareaEntrega {
  id_tarea: number;
  id_entrega: number;
  titulo: string;
  fecha_limite: string;
  estado: string;
}

// US6 - Task Leo: lógica que evalúa si la fecha límite expiró para deshabilitar la entrega
function esFechaExpirada(fechaLimite: string): boolean {
  if (!fechaLimite) return false;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const limite = new Date(fechaLimite); limite.setHours(0, 0, 0, 0);
  return limite < hoy;
}

export default function EntregaArchivo({ id_estudiante, showToast }: EntregaArchivoProps) {
  const [tareas, setTareas] = useState<TareaEntrega[]>([]);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaEntrega | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [comentario, setComentario] = useState("");
  const [entregaInfo, setEntregaInfo] = useState<EntregaInfo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [entregando, setEntregando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // US6 - Task Leo: validación que habilita la carga solo si el estado es "Asignada" o "Sin entregar"
  const cargarTareas = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`/api/entregas?id_estudiante=${id_estudiante}`);
      const data = await res.json();
      if (data.ok) {
        const pendientes: TareaEntrega[] = data.entregas
          .filter((e: { estado: string; id_entrega: number; id_tarea: number; titulo_tarea: string; fecha_limite: string }) =>
            ["Asignada", "Sin_entregar"].includes(e.estado)
          )
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const nuevos = selected.map((f) => ({ id: Date.now() + Math.random(), file: f }));
    setFiles((prev) => [...prev, ...nuevos]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (id: number) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const formatBytes = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(2)} MB`;

  // US6 - Task Esteban: botón "Entregar" habilitado solo si hay al menos un archivo en cola
  // US6 - Task Nicole: sube el archivo al servidor y guarda su ruta en BD vía POST /api/entregas
  // US6 - Task Reynaldo: registra fecha/hora en BD y evalúa si el estado final es "Entregada" o "Con_retraso"
  const handleEntregar = async () => {
    if (!tareaSeleccionada) { showToast("Selecciona una tarea."); return; }
    if (files.length === 0) { showToast("Debes adjuntar al menos un archivo."); return; }

    setEntregando(true);
    try {
      const formData = new FormData();
      formData.append("id_entrega", String(tareaSeleccionada.id_entrega));
      formData.append("tipo", "archivo");
      formData.append("archivo", files[0].file);

      const res = await fetch("/api/entregas", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) { showToast(data.error ?? "Error al entregar."); return; }

      setEntregaInfo({ fechaEntrega: new Date(data.fecha_entrega).toLocaleString(), estado: data.estado });
      showToast(data.estado === "Entregada" ? "✅ Tarea entregada a tiempo" : "⚠️ Tarea entregada con retraso");
      setFiles([]);
      setTareas((prev) => prev.filter((t) => t.id_entrega !== tareaSeleccionada.id_entrega));
      setTareaSeleccionada(null);
    } catch {
      showToast("Error de red al entregar.");
    } finally {
      setEntregando(false);
    }
  };

  // US6 - Task Brenda: interfaz gráfica con botón adjuntar, zona de carga y cuadro de confirmación
  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>Entregar tarea — Archivo</div>
      </div>

      {cargando && <div className="task-meta" style={{ color: "#534AB7" }}>⏳ Cargando tareas…</div>}

      {!cargando && tareas.length === 0 && !entregaInfo && (
        <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--color-text-secondary)" }}>
          No tienes tareas pendientes de entrega. ✅
        </div>
      )}

      {!cargando && tareas.length > 0 && (
        <>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Selecciona la tarea a entregar</div>
            <select
              className="form-input"
              value={tareaSeleccionada?.id_entrega ?? ""}
              onChange={(e) => {
                const t = tareas.find((x) => x.id_entrega === Number(e.target.value));
                setTareaSeleccionada(t ?? null);
                setEntregaInfo(null);
                setFiles([]);
              }}
            >
              {tareas.map((t) => (
                <option key={t.id_entrega} value={t.id_entrega}>{t.titulo}</option>
              ))}
            </select>
            {tareaSeleccionada && (
              <div style={{ fontSize: 12, marginTop: 6, color: expirada ? "#D93025" : "var(--color-text-secondary)" }}>
                Fecha límite: {new Date(tareaSeleccionada.fecha_limite).toLocaleString()}
                {expirada && " — Expirada"}
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-title">Subir archivos</div>

            <input
              ref={inputRef}
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png"
            />

            <div className="upload-zone" onClick={() => inputRef.current?.click()}>
              <div className="upload-zone-icon">↑</div>
              <div className="upload-zone-text">Arrastra archivos aquí o haz clic para seleccionar</div>
              <div className="upload-zone-sub">PDF, DOCX, PPTX, imágenes — máx 50 MB por archivo</div>
            </div>

            <div>
              {files.map((f) => (
                <div key={f.id} className="file-chip">
                  <span className="file-chip-icon">📄</span>
                  <span>{f.file.name}</span>
                  <span style={{ marginLeft: "auto", color: "var(--color-text-tertiary)", fontSize: 11 }}>
                    {formatBytes(f.file.size)}
                  </span>
                  <span className="file-chip-remove" onClick={() => removeFile(f.id)}>✕</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14 }}>
              <label className="form-label">Comentario para el profesor (opcional)</label>
              <textarea
                className="form-input form-textarea"
                style={{ minHeight: 60 }}
                placeholder="Agregar una nota o aclaración sobre tu entrega..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>

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

            <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                className="btn btn-primary"
                onClick={handleEntregar}
                disabled={files.length === 0 || entregando}
                style={{ opacity: files.length === 0 ? 0.5 : 1 }}
              >
                {entregando ? "Entregando…" : "Entregar tarea"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
