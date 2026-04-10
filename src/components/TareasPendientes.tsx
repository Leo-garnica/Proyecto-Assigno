import { ViewId } from "@/app/page";

interface TareasPendientesProps {
  onNavigate: (view: ViewId) => void;
}

export default function TareasPendientes({ onNavigate }: TareasPendientesProps) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>
          Tareas pendientes
        </div>
        <select className="form-input" style={{ width: "auto", fontSize: 12 }}>
          <option>Todas las materias</option>
          <option>Historia</option>
          <option>Química</option>
          <option>Biología</option>
          <option>Matemáticas</option>
        </select>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {/* Vence hoy - urgente */}
        <div className="card" style={{ borderLeft: "3px solid #E24B4A", borderRadius: "0 var(--border-radius-lg) var(--border-radius-lg) 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
                Ensayo — Revolución Industrial
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
                Historia · Prof. Ramírez · 100 pts
              </div>
              <span className="badge badge-late" style={{ marginTop: 6 }}>Vence hoy</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate("entrega-archivo")}>
              Entregar
            </button>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 10, paddingTop: 10, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
            Redactar un ensayo analítico de mínimo 1500 palabras con fuentes primarias.
          </div>
        </div>

        {/* Vence en 6 días */}
        <div className="card" style={{ borderLeft: "3px solid #EF9F27", borderRadius: "0 var(--border-radius-lg) var(--border-radius-lg) 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
                Mapa conceptual — Ecosistemas
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
                Biología · Prof. Herrera · 80 pts
              </div>
              <span className="badge badge-pending" style={{ marginTop: 6 }}>Vence en 6 días</span>
            </div>
            <button className="btn btn-sm" onClick={() => onNavigate("entrega-archivo")}>
              Entregar
            </button>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 10, paddingTop: 10, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
            Elaborar un mapa conceptual digital sobre cadenas alimenticias en 3 ecosistemas distintos.
          </div>
        </div>

        {/* Vence en 12 días */}
        <div className="card" style={{ borderLeft: "3px solid #EF9F27", borderRadius: "0 var(--border-radius-lg) var(--border-radius-lg) 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
                Proyecto Final — Física
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
                Física · Prof. Torres · 150 pts
              </div>
              <span className="badge badge-pending" style={{ marginTop: 6 }}>Vence en 12 días</span>
            </div>
            <button className="btn btn-sm" onClick={() => onNavigate("entrega-enlace")}>
              Entregar enlace
            </button>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 10, paddingTop: 10, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
            Subir video demostrativo del experimento a YouTube y compartir el enlace.
          </div>
        </div>

        {/* Vence en 18 días */}
        <div className="card" style={{ borderLeft: "3px solid #AFA9EC", borderRadius: "0 var(--border-radius-lg) var(--border-radius-lg) 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
                Resolución — Integrales dobles
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
                Matemáticas · Prof. Quispe · 60 pts
              </div>
              <span className="badge badge-pending" style={{ marginTop: 6 }}>Vence en 18 días</span>
            </div>
            <button className="btn btn-sm" onClick={() => onNavigate("entrega-archivo")}>
              Entregar
            </button>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 10, paddingTop: 10, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
            Resolver los ejercicios 3, 5 y 7 del capítulo 9. Mostrar procedimiento completo.
          </div>
        </div>
      </div>
    </div>
  );
}