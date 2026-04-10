"use client";

import { useState } from "react";

export default function Calificaciones() {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>Mis calificaciones</div>
        <div style={{ display: "flex", gap: 8 }}>
          <select className="form-input" style={{ width: "auto", fontSize: 12 }}>
            <option>Todas las materias</option>
          </select>
          <select className="form-input" style={{ width: "auto", fontSize: 12 }}>
            <option>2026 — Semestre I</option>
          </select>
        </div>
      </div>

      <div className="metrics-grid" style={{ marginBottom: 20 }}>
        <div className="metric-card">
          <div className="metric-label">Promedio general</div>
          <div className="metric-value" style={{ color: "#534AB7" }}>87</div>
          <div className="metric-sub">Sobre 100 pts</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Tareas calificadas</div>
          <div className="metric-value">6</div>
          <div className="metric-sub">De 7 entregadas</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Nota más alta</div>
          <div className="metric-value" style={{ color: "#3B6D11" }}>98</div>
          <div className="metric-sub">Química</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Por calificar</div>
          <div className="metric-value" style={{ color: "#BA7517" }}>1</div>
          <div className="metric-sub">Matemáticas</div>
        </div>
      </div>

      <div className="card">
        <table className="grade-table">
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Materia</th>
              <th>Entregada</th>
              <th>Puntos</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 500 }}>Lab Química — Reacciones</td>
              <td style={{ color: "var(--color-text-secondary)" }}>Química</td>
              <td style={{ color: "var(--color-text-secondary)" }}>6 abr</td>
              <td><div className="grade-circle" style={{ background: "#EAF3DE", color: "#3B6D11" }}>92</div></td>
              <td><span className="badge badge-graded">Calificada</span></td>
              <td><button className="btn btn-sm" onClick={() => setShowFeedback(true)}>Ver feedback</button></td>
            </tr>
            <tr>
              <td style={{ fontWeight: 500 }}>Ejercicios Funciones</td>
              <td style={{ color: "var(--color-text-secondary)" }}>Matemáticas</td>
              <td style={{ color: "var(--color-text-secondary)" }}>3 abr</td>
              <td><div className="grade-circle" style={{ background: "#EAF3DE", color: "#3B6D11" }}>85</div></td>
              <td><span className="badge badge-graded">Calificada</span></td>
              <td><button className="btn btn-sm" onClick={() => setShowFeedback(true)}>Ver feedback</button></td>
            </tr>
            <tr>
              <td style={{ fontWeight: 500 }}>Análisis de texto</td>
              <td style={{ color: "var(--color-text-secondary)" }}>Historia</td>
              <td style={{ color: "var(--color-text-secondary)" }}>28 mar</td>
              <td><div className="grade-circle" style={{ background: "#FAEEDA", color: "#854F0B" }}>78</div></td>
              <td><span className="badge badge-graded">Calificada</span></td>
              <td><button className="btn btn-sm" onClick={() => setShowFeedback(true)}>Ver feedback</button></td>
            </tr>
            <tr>
              <td style={{ fontWeight: 500 }}>Informe Biología</td>
              <td style={{ color: "var(--color-text-secondary)" }}>Biología</td>
              <td style={{ color: "var(--color-text-secondary)" }}>20 mar</td>
              <td><div className="grade-circle" style={{ background: "#EAF3DE", color: "#3B6D11" }}>95</div></td>
              <td><span className="badge badge-graded">Calificada</span></td>
              <td><button className="btn btn-sm" onClick={() => setShowFeedback(true)}>Ver feedback</button></td>
            </tr>
            <tr>
              <td style={{ fontWeight: 500 }}>Resolución Trigonometría</td>
              <td style={{ color: "var(--color-text-secondary)" }}>Matemáticas</td>
              <td style={{ color: "var(--color-text-secondary)" }}>5 abr</td>
              <td><div className="grade-circle" style={{ background: "var(--color-background-secondary)", color: "var(--color-text-secondary)" }}>—</div></td>
              <td><span className="badge badge-delivered">En revisión</span></td>
              <td><span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Esperando</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {showFeedback && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Retroalimentación del profesor</div>
            <button className="btn btn-sm" onClick={() => setShowFeedback(false)}>✕ Cerrar</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 500, color: "#534AB7" }}>92</div>
            <div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Puntuación</div>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`star${i <= 4 ? " active" : ""}`}>★</span>
                ))}
              </div>
            </div>
          </div>
          <div className="feedback-box">
            <div className="feedback-label">Comentario del profesor</div>
            <div className="feedback-text">
              Excelente trabajo en la identificación de las reacciones. La metodología fue clara y bien documentada.
              Para mejorar: agrega más precisión en las unidades del resultado final y asegúrate de justificar las variables de control.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Contenido", value: "38/40" },
              { label: "Metodología", value: "30/35" },
              { label: "Presentación", value: "24/25" },
            ].map((item) => (
              <div key={item.label} style={{ padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}