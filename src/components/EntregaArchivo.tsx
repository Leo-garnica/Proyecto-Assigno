"use client";

import { useState } from "react";

interface EntregaArchivoProps {
  showToast: (msg: string) => void;
}

interface FileChip {
  id: number;
  name: string;
  size: string;
}

interface EntregaInfo {
  fechaEntrega: string;
  estado: string;
}

function esFechaExpirada(fechaLimite: string): boolean {
  if (!fechaLimite) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date(fechaLimite);
  limite.setHours(0, 0, 0, 0);
  return limite < hoy;
}

export default function EntregaArchivo({ showToast }: EntregaArchivoProps) {
  const [files, setFiles] = useState<FileChip[]>([
    { id: 1, name: "Ensayo_RevolucionIndustrial_v2.pdf", size: "2.3 MB" },
  ]);

  const [comentario, setComentario] = useState("");
  const [entregaInfo, setEntregaInfo] = useState<EntregaInfo | null>(null);

  const fechaLimite = "2026-04-20T23:59:00";
  const expirada = esFechaExpirada(fechaLimite); // ← NUEVO

  const addFakeFile = () => {
    const names = [
      "Tarea_Historia_final.pdf",
      "Evidencia_experimento.docx",
      "Presentacion_ecosistemas.pptx",
    ];
    const name = names[Math.floor(Math.random() * names.length)];
    const size = `${(Math.random() * 3 + 0.5).toFixed(1)} MB`;
    setFiles((prev) => [...prev, { id: Date.now(), name, size }]);
  };

  const removeFile = (id: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleEntregar = () => {
    if (files.length === 0) {
      showToast("Debes adjuntar al menos un archivo");
      return;
    }

    const ahora = new Date();
    const limite = new Date(fechaLimite);
    const estado = ahora <= limite ? "Entregado" : "Con retraso";

    setEntregaInfo({ fechaEntrega: ahora.toLocaleString(), estado });
    showToast(
      estado === "Entregado"
        ? "Tarea entregada a tiempo"
        : "Tarea entregada con retraso"
    );
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>
          Entregar tarea — Archivo
        </div>

        {/* ↓ NUEVO: color rojo si expirada */}
        <div style={{ fontSize: 12, color: expirada ? "#D93025" : "var(--color-text-secondary)", marginTop: 2 }}>
          Ensayo — Revolución Industrial · Historia · Fecha límite:{" "}
          {new Date(fechaLimite).toLocaleString()}
          {expirada && " — Expirada"} {/* ← NUEVO */}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Instrucciones</div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          Redactar un ensayo analítico de mínimo 1500 palabras con al menos 3
          fuentes primarias. Formato: PDF o DOCX, fuente 12pt, interlineado 1.5.
        </div>
      </div>

      <div className="card">
        <div className="section-title">Subir archivos</div>

        <div className="upload-zone" onClick={addFakeFile}>
          <div className="upload-zone-icon">↑</div>
          <div className="upload-zone-text">Arrastra archivos aquí o haz clic para seleccionar</div>
          <div className="upload-zone-sub">PDF, DOCX, PPTX, imágenes — máx 50 MB por archivo</div>
        </div>

        <div>
          {files.map((file) => (
            <div key={file.id} className="file-chip">
              <span className="file-chip-icon">📄</span>
              <span>{file.name}</span>
              <span style={{ marginLeft: "auto", color: "var(--color-text-tertiary)", fontSize: 11 }}>
                {file.size}
              </span>
              <span className="file-chip-remove" onClick={() => removeFile(file.id)}>✕</span>
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
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 8,
              background: entregaInfo.estado === "Entregado" ? "#EAF3DE" : "#FCEBEB",
              color: entregaInfo.estado === "Entregado" ? "#3B6D11" : "#A32D2D",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Estado: {entregaInfo.estado} <br />
            Fecha de entrega: {entregaInfo.fechaEntrega}
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn" onClick={() => showToast("Borrador guardado")}>
            Guardar borrador
          </button>
          <button className="btn btn-primary" onClick={handleEntregar}>
            Entregar tarea
          </button>
        </div>
      </div>
    </div>
  );
}