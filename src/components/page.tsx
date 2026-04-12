"use client";

import { useState } from "react";
import DashboardDocente from "@/components/shared/DashboardDocente";
import DashboardEstudiante from "@/components/shared/DashboardEstudiante";

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  curso: string;
  fechaLimite: string;
  puntosMaximos: number;
  tipoEntrega: string;
  notificar: boolean;
  permitirTardia: boolean;
  estado: string;
  archivoNombre?: string | null;
  archivoUrl?: string | null;
  archivoTamano?: number | null;
}

export type ViewId =
  | "dashboard"
  | "nueva-tarea"
  | "pendientes"
  | "calificaciones"
  | "entrega-archivo"
  | "entrega-enlace"
  | "vista-previa"
  | "notificaciones";

type Rol = "Docente" | "Estudiante";

// ── Usuarios fijos para demo (sin login) ──────────────────────────────────────
const DOCENTE_DEMO  = { id_usuario: 1, nombre: "Docente Demo",   correo: "docente@assigno.dev"  };
const ESTUDIANTE_DEMO = { id_usuario: 2, nombre: "Estudiante Demo", correo: "estudiante@assigno.dev" };

export default function App() {
  const [rol, setRol] = useState<Rol>("Docente");

  const [tareasCompartidas, setTareasCompartidas] = useState<Tarea[]>([]);
  const [notificacionesCompartidas, setNotificacionesCompartidas] = useState<string[]>([]);

  const toggleRol = () => setRol((r) => (r === "Docente" ? "Estudiante" : "Docente"));

  if (rol === "Docente") {
    return (
      <DashboardDocente
        id_usuario={DOCENTE_DEMO.id_usuario}
        nombre={DOCENTE_DEMO.nombre}
        correo={DOCENTE_DEMO.correo}
        onToggleRol={toggleRol}
        rolActual={rol}
        initialTareas={tareasCompartidas}
        initialNotificaciones={notificacionesCompartidas}
        onTareasChange={setTareasCompartidas}
        onNotificacionesChange={setNotificacionesCompartidas}
      />
    );
  }

  return (
    <DashboardEstudiante
      id_usuario={ESTUDIANTE_DEMO.id_usuario}
      nombre={ESTUDIANTE_DEMO.nombre}
      correo={ESTUDIANTE_DEMO.correo}
      onToggleRol={toggleRol}
      rolActual={rol}
      tareasDocente={tareasCompartidas}
      notificacionesDocente={notificacionesCompartidas}
    />
  );
}
