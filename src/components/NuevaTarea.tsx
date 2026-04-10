interface NuevaTareaProps {
  showToast: (msg: string) => void;
}

export default function NuevaTarea({ showToast }: NuevaTareaProps) {
  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>Crear nueva tarea</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
            Completa los datos para publicar la tarea al grupo
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => showToast("Tarea publicada correctamente")}>
          Publicar tarea
        </button>
      </div>

      <div className="card">
        <div className="form-row">
          <label className="form-label">Título de la tarea</label>
          <input
            className="form-input"
            type="text"
            placeholder="Ej. Ensayo sobre la Revolución Industrial"
            defaultValue="Proyecto Final — Análisis histórico"
          />
        </div>

        <div className="form-row">
          <label className="form-label">Descripción / Instrucciones</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Describe las instrucciones detalladas para los estudiantes..."
            defaultValue="Elaborar un análisis comparativo de al menos 3 fuentes primarias sobre el período 1780-1850, incluyendo referencias bibliográficas en formato APA."
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-row">
            <label className="form-label">Curso</label>
            <select className="form-input">
              <option>Historia — 3° A</option>
              <option>Historia — 3° B</option>
              <option>Química — 2° A</option>
            </select>
          </div>
          <div className="form-row">
            <label className="form-label">Fecha límite</label>
            <input className="form-input" type="date" defaultValue="2026-04-20" />
          </div>
          <div className="form-row">
            <label className="form-label">Puntos máximos</label>
            <input className="form-input" type="number" defaultValue={100} />
          </div>
          <div className="form-row">
            <label className="form-label">Tipo de entrega</label>
            <select className="form-input">
              <option>Archivo (PDF, DOCX...)</option>
              <option>Enlace / URL</option>
              <option>Texto en línea</option>
              <option>Cualquiera</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">Adjuntar material de apoyo (opcional)</label>
          <div className="upload-zone" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
              ↑ Arrastra archivos o haz clic para adjuntar
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 }}>
              PDF, DOCX, imágenes — máx 20 MB
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-text-secondary)", cursor: "pointer" }}>
            <input type="checkbox" defaultChecked /> Notificar a estudiantes
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-text-secondary)", cursor: "pointer", marginLeft: 16 }}>
            <input type="checkbox" /> Permitir entrega tardía
          </label>
        </div>
      </div>
    </div>
  );
}