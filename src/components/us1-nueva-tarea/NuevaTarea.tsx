"use client";

import { useRef, useState } from "react";
import { Tarea } from "@/app/page";

interface NuevaTareaProps {
  id_docente: number;
  showToast: (msg: string) => void;
  onCrear: (tarea: Tarea) => void;
}

const MAX_BYTES = 50 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function NuevaTarea({ id_docente, showToast, onCrear }: NuevaTareaProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [notificar, setNotificar] = useState(true);
  const [permitirTardia, setPermitirTardia] = useState(false);

  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoError, setArchivoError] = useState<string | null>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // US1 - Task Nicole: validación en vivo del título obligatorio
  const [tituloTouched, setTituloTouched] = useState(false);
  const tituloError = tituloTouched && !titulo.trim();

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArchivoError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) { setArchivo(null); return; }
    if (f.type !== "application/pdf") {
      setArchivoError("Solo se aceptan archivos PDF.");
      setArchivo(null);
      if (inputArchivoRef.current) inputArchivoRef.current.value = "";
      return;
    }
    if (f.size > MAX_BYTES) {
      setArchivoError(`El archivo supera el límite de 50 MB (tamaño actual: ${formatBytes(f.size)}).`);
      setArchivo(null);
      if (inputArchivoRef.current) inputArchivoRef.current.value = "";
      return;
    }
    setArchivo(f);
  };

  const quitarArchivo = () => {
    setArchivo(null);
    setArchivoError(null);
    if (inputArchivoRef.current) inputArchivoRef.current.value = "";
  };

  const limpiarFormulario = () => {
    setTitulo("");
    setDescripcion("");
    setFechaLimite("");
    setNotificar(true);
    setPermitirTardia(false);
    setTituloTouched(false);
    setErrorForm(null);
    quitarArchivo();
  };

  // US1 - Task Leo: envía los datos al backend para INSERT en tabla Tareas en BD
  // US1 - Task Reynaldo: al recibir respuesta exitosa, llama onCrear() para actualizar el tablón principal
  const handlePublicar = async () => {
    setTituloTouched(true);
    setErrorForm(null);

    if (!titulo.trim()) {
      setErrorForm("El título de la tarea es obligatorio.");
      return;
    }
    if (!fechaLimite) {
      setErrorForm("La fecha límite es obligatoria.");
      return;
    }

    setGuardando(true);
    try {
      const formData = new FormData();
      formData.append("id_docente", String(id_docente));
      formData.append("titulo", titulo.trim());
      formData.append("descripcion", descripcion.trim() || "");
      formData.append("fecha_limite", fechaLimite);
      formData.append("notificar", String(notificar));
      if (archivo) {
        formData.append("archivo", archivo);
      }

      const res = await fetch("/api/tareas", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorForm(data.error || "Error al guardar la tarea.");
        return;
      }

      // US1 - Task Reynaldo: construye el objeto tarea con el id real de BD y lo propaga al tablón
      const nuevaTarea: Tarea = {
        id: data.id_tarea,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        curso: "General",
        fechaLimite,
        puntosMaximos: 100,
        tipoEntrega: "Archivo (PDF, DOCX...)",
        notificar,
        permitirTardia,
        estado: "Asignada",
        archivoNombre: data.archivo_nombre ?? null,
        archivoUrl: data.archivo_url ?? null,
        archivoTamano: data.archivo_tamano ?? null,
      };

      onCrear(nuevaTarea);

      const msg =
        data.estudiantes_asignados > 0
          ? `Tarea publicada y asignada a ${data.estudiantes_asignados} estudiante(s)`
          : "Tarea publicada (ningún estudiante registrado aún)";

      showToast(msg);
      limpiarFormulario();
    } catch {
      setErrorForm("No se pudo conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  // US1 - Task Esteban: interfaz del formulario con campos título, descripción, fecha límite y archivo adjunto
  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>
            Crear nueva tarea
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
            La tarea se asignará automáticamente a todos los estudiantes registrados
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={handlePublicar}
          disabled={guardando}
          style={{ opacity: guardando ? 0.7 : 1, cursor: guardando ? "not-allowed" : "pointer" }}
        >
          {guardando ? "Publicando…" : "Publicar tarea"}
        </button>
      </div>

      {errorForm && (
        <div style={{
          background: "#FCEBEB", color: "#A32D2D", fontSize: 12,
          padding: "9px 12px", borderRadius: "var(--border-radius-md)",
          marginBottom: 14, display: "flex", alignItems: "center", gap: 6,
        }}>
          <span>⚠</span> {errorForm}
        </div>
      )}

      <div className="card">
        <div className="form-row">
          <label className="form-label">
            Título de la tarea <span style={{ color: "#E24B4A" }}>*</span>
          </label>
          <input
            className="form-input"
            type="text"
            placeholder="Ej. Ensayo sobre la Revolución Industrial"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onBlur={() => setTituloTouched(true)}
            style={{ borderColor: tituloError ? "#E24B4A" : undefined }}
          />
          {tituloError && (
            <div style={{ fontSize: 11, color: "#E24B4A", marginTop: 4 }}>
              El título es obligatorio.
            </div>
          )}
        </div>

        <div className="form-row">
          <label className="form-label">Descripción / Instrucciones</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Describe las instrucciones detalladas para los estudiantes..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="form-label">
            Fecha límite <span style={{ color: "#E24B4A" }}>*</span>
          </label>
          <input
            className="form-input"
            type="date"
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            style={{ maxWidth: 220 }}
          />
        </div>

        <div className="form-row">
          <label className="form-label">
            Archivo adjunto <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 400 }}>
              (opcional · solo PDF · máx. 50 MB)
            </span>
          </label>

          {!archivo ? (
            <div
              onClick={() => inputArchivoRef.current?.click()}
              style={{
                border: "2px dashed var(--color-border)",
                borderRadius: "var(--border-radius-md)",
                padding: "18px 16px",
                textAlign: "center",
                cursor: "pointer",
                color: "var(--color-text-secondary)",
                fontSize: 13,
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#534AB7")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>📄</div>
              <div>Haz clic para seleccionar un PDF</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Máximo 50 MB</div>
            </div>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#F0EFFE", borderRadius: "var(--border-radius-md)",
              padding: "10px 14px",
            }}>
              <span style={{ fontSize: 22 }}>📄</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {archivo.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                  {formatBytes(archivo.size)}
                </div>
              </div>
              <button
                onClick={quitarArchivo}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#A32D2D", fontSize: 18, lineHeight: 1, padding: 2,
                }}
                title="Quitar archivo"
              >✕</button>
            </div>
          )}

          <input
            ref={inputArchivoRef}
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={handleArchivoChange}
          />

          {archivoError && (
            <div style={{ fontSize: 11, color: "#E24B4A", marginTop: 4 }}>
              ⚠ {archivoError}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-text-secondary)", cursor: "pointer" }}>
            <input type="checkbox" checked={notificar} onChange={(e) => setNotificar(e.target.checked)} />
            Notificar a estudiantes
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-text-secondary)", cursor: "pointer", marginLeft: 16 }}>
            <input type="checkbox" checked={permitirTardia} onChange={(e) => setPermitirTardia(e.target.checked)} />
            Permitir entrega tardía
          </label>
        </div>

        {guardando && (
          <div style={{ marginTop: 12, fontSize: 12, color: "#534AB7", display: "flex", alignItems: "center", gap: 6 }}>
            <span>⏳</span> Guardando en base de datos y asignando a estudiantes…
          </div>
        )}
      </div>
    </div>
  );
}
