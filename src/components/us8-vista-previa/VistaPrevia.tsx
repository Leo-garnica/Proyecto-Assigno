"use client";

import { ChangeEvent, useMemo, useState } from "react";

export default function VistaPrevia() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // US8 - Task Reinaldo: integración del visor en la interfaz para previsualizar PDF, JPG y PNG sin descargar
  const handleSeleccionarArchivo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setArchivo(null);
      setPreviewUrl(null);
      return;
    }

    setArchivo(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const quitarArchivo = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setArchivo(null);
    setPreviewUrl(null);
  };

  const esImagen = useMemo(() => {
    if (!archivo) return false;
    return archivo.type.startsWith("image/");
  }, [archivo]);

  const esPDF = useMemo(() => {
    if (!archivo) return false;
    return archivo.type === "application/pdf";
  }, [archivo]);

  // US8 - Task Brenda: método para extraer y renderizar los metadatos del documento (nombre y tamaño)
  const tamanoLegible = useMemo(() => {
    if (!archivo) return "";
    const kb = archivo.size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }, [archivo]);

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="card">
        <div className="section-title">Seleccionar archivo</div>

        <div className="form-row">
          <label className="form-label">
            Elige un archivo de tu dispositivo
          </label>

          <input
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg"
            className="form-input"
            onChange={handleSeleccionarArchivo}
          />
        </div>

        <div className="task-meta">
          Formatos permitidos: PDF, PNG, JPG, JPEG
        </div>
      </div>

      {archivo && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="section-title">Archivo seleccionado</div>

          <div className="preview-file" style={{ cursor: "default" }}>
            <div className="preview-icon" style={{ background: "#EEEDFE" }}>
              {esPDF ? "📄" : esImagen ? "🖼️" : "📁"}
            </div>

            <div>
              <div className="preview-name">{archivo.name}</div>
              <div className="preview-size">{tamanoLegible}</div>
            </div>

            <button className="btn btn-sm" onClick={quitarArchivo}>
              Quitar
            </button>
          </div>
        </div>
      )}

      {archivo && previewUrl && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="section-title">Vista previa</div>

          {esImagen && (
            <img
              src={previewUrl}
              alt={archivo.name}
              style={{
                width: "100%",
                maxHeight: 420,
                objectFit: "contain",
                borderRadius: 8,
                marginTop: 10,
                border: "0.5px solid var(--color-border-tertiary)",
              }}
            />
          )}

          {esPDF && (
            <iframe
              src={previewUrl}
              title="Vista previa PDF"
              style={{
                width: "100%",
                height: 500,
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 8,
                marginTop: 10,
              }}
            />
          )}

          {!esImagen && !esPDF && (
            <div className="task-meta" style={{ marginTop: 10 }}>
              No se puede previsualizar este tipo de archivo.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
