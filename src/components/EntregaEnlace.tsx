"use client";

import { useMemo, useState } from "react";

interface EntregaEnlaceProps {
  showToast: (msg: string) => void;
}

export default function EntregaEnlace({ showToast }: EntregaEnlaceProps) {
  const [url, setUrl] = useState("");
  const [comentario, setComentario] = useState("");

  const esUrlValida = useMemo(() => {
    try {
      const valor = url.trim();
      if (!valor) return false;

      const urlObj = new URL(valor);

      const protocoloValido =
        urlObj.protocol === "http:" || urlObj.protocol === "https:";

      const hostValido = ["github.com", "gitlab.com", "bitbucket.org"].includes(
        urlObj.hostname
      );

      return protocoloValido && hostValido;
    } catch {
      return false;
    }
  }, [url]);

  const handleCancelar = () => {
    setUrl("");
    setComentario("");
    showToast("Entrega cancelada");
  };

  const handleEntregar = () => {
    if (!esUrlValida) {
      showToast("Ingresa un enlace válido");
      return;
    }

    showToast("Enlace listo para entregar");
  };

  return (
    <div className="two-col" style={{ gridTemplateColumns: "1fr" }}>
      
      {/* INSTRUCCIONES */}
      <div className="card">
        <div className="section-title">Instrucciones</div>
        <p className="task-meta" style={{ fontSize: "13px" }}>
          Envía la URL de tu repositorio con el código fuente del proyecto.
          Asegúrate de que el repositorio sea público o que el docente tenga acceso.
        </p>
      </div>

      {/* FORMULARIO */}
      <div className="card">
        <div className="section-title">Enlace del repositorio</div>

        {/* INPUT */}
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

        {/* AYUDA */}
        <div className="task-meta">
          Se aceptan repositorios de GitHub, GitLab o Bitbucket
        </div>

        <div style={{ marginTop: 8 }}>
          <span className="badge badge-graded">github.com</span>{" "}
          <span className="badge badge-graded">gitlab.com</span>{" "}
          <span className="badge badge-graded">bitbucket.org</span>
        </div>

        {/* VALIDACIÓN */}
        {url.trim() !== "" && (
          <div
            className="badge"
            style={{
              marginTop: 10,
              background: esUrlValida ? "#EAF3DE" : "#FCEBEB",
              color: esUrlValida ? "#3B6D11" : "#A32D2D",
            }}
          >
            {esUrlValida
              ? "Repositorio válido"
              : "El enlace no es válido"}
          </div>
        )}

        {/* COMENTARIO */}
        <div className="form-row" style={{ marginTop: 16 }}>
          <label className="form-label">
            Comentario para el profesor (opcional)
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Agrega una nota o aclaración sobre tu entrega..."
            className="form-input form-textarea"
          />
        </div>

        {/* BOTONES */}
        <div className="modal-footer">
          <button className="btn" onClick={handleCancelar}>
            Cancelar
          </button>

          <button
            className={`btn btn-primary ${!esUrlValida ? "btn-disabled" : ""}`}
            disabled={!esUrlValida}
            onClick={handleEntregar}
          >
            Entregar
          </button>
        </div>
      </div>
    </div>
  );
}