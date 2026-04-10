"use client";

import { useMemo, useState } from "react";

interface EntregaEnlaceProps {
  showToast: (msg: string) => void;
}

interface EntregaInfo {
  fechaEntrega: string;
  estado: string;
}

export default function EntregaEnlace({ showToast }: EntregaEnlaceProps) {
  const [url, setUrl] = useState("");
  const [comentario, setComentario] = useState("");
  const [entregaInfo, setEntregaInfo] = useState<EntregaInfo | null>(null);

  // Cambia esta fecha para probar entregas a tiempo o con retraso
  const fechaLimite = "2026-04-20T23:59:00";

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
    setEntregaInfo(null);
    showToast("Entrega cancelada");
  };

  const handleEntregar = () => {
    if (!esUrlValida) {
      showToast("Ingresa un enlace válido");
      return;
    }

    const ahora = new Date();
    const limite = new Date(fechaLimite);

    const estado = ahora <= limite ? "Entregado" : "Con retraso";

    const nuevaEntrega = {
      fechaEntrega: ahora.toLocaleString(),
      estado,
    };

    setEntregaInfo(nuevaEntrega);

    showToast(
      estado === "Entregado"
        ? "Enlace entregado a tiempo"
        : "Enlace entregado con retraso"
    );
  };

  return (
    <div className="two-col" style={{ gridTemplateColumns: "1fr" }}>
      <div className="card">
        <div className="section-title">Instrucciones</div>
        <p className="task-meta" style={{ fontSize: "13px" }}>
          Envía la URL de tu repositorio con el código fuente del proyecto.
          Asegúrate de que el repositorio sea público o que el docente tenga acceso.
        </p>
        <p className="task-meta" style={{ fontSize: "12px", marginTop: 8 }}>
          Fecha límite: {new Date(fechaLimite).toLocaleString()}
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

        <div className="task-meta">
          Se aceptan repositorios de GitHub, GitLab o Bitbucket
        </div>

        <div style={{ marginTop: 8 }}>
          <span className="badge badge-graded">github.com</span>{" "}
          <span className="badge badge-graded">gitlab.com</span>{" "}
          <span className="badge badge-graded">bitbucket.org</span>
        </div>

        {url.trim() !== "" && (
          <div
            className="badge"
            style={{
              marginTop: 10,
              background: esUrlValida ? "#EAF3DE" : "#FCEBEB",
              color: esUrlValida ? "#3B6D11" : "#A32D2D",
            }}
          >
            {esUrlValida ? "Repositorio válido" : "El enlace no es válido"}
          </div>
        )}

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

        {entregaInfo && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 8,
              background:
                entregaInfo.estado === "Entregado" ? "#EAF3DE" : "#FCEBEB",
              color:
                entregaInfo.estado === "Entregado" ? "#3B6D11" : "#A32D2D",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Estado: {entregaInfo.estado}
            <br />
            Fecha de entrega: {entregaInfo.fechaEntrega}
          </div>
        )}

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