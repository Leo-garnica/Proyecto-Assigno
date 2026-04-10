"use client";

import { useState } from "react";
import Sidebar from "@/layout/Sidebar";
import Topbar from "@/layout/Topbar";
import Dashboard from "@/components/Dashboard";
import NuevaTarea from "@/components/NuevaTarea";
import TareasPendientes from "@/components/TareasPendientes";
import Calificaciones from "@/components/Calificaciones";
import EntregaArchivo from "@/components/EntregaArchivo";
import EntregaEnlace from "@/components/EntregaEnlace";
import VistaPrevia from "@/components/VistaPrevia";
import Notificaciones from "@/components/Notificaciones";
import Toast from "@/components/Toast";

export type ViewId =
  | "dashboard"
  | "nueva-tarea"
  | "pendientes"
  | "calificaciones"
  | "entrega-archivo"
  | "entrega-enlace"
  | "vista-previa"
  | "notificaciones";

const titles: Record<ViewId, string> = {
  dashboard: "Panel principal",
  "nueva-tarea": "Crear nueva tarea",
  pendientes: "Tareas pendientes",
  calificaciones: "Mis calificaciones",
  "entrega-archivo": "Entregar archivo",
  "entrega-enlace": "Entregar enlace",
  "vista-previa": "Vista previa de archivos",
  notificaciones: "Notificaciones",
};

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
}

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [toast, setToast] = useState<string | null>(null);

  // Estado compartido de tareas
  const [tareas, setTareas] = useState<Tarea[]>([]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const navigate = (view: ViewId) => setActiveView(view);

  const agregarTarea = (tarea: Tarea) => {
    setTareas((prev) => [tarea, ...prev]);
  };

  return (
    <div className="app">
      <Sidebar activeView={activeView} onNavigate={navigate} />

      <div className="main">
        <Topbar
          title={titles[activeView]}
          onNotifClick={() => navigate("notificaciones")}
        />

        <div className="content">
          {activeView === "dashboard" && <Dashboard tareas={tareas} />}

          {activeView === "nueva-tarea" && (
            <NuevaTarea showToast={showToast} onCrear={agregarTarea} />
          )}

          {activeView === "pendientes" && (
           <TareasPendientes onNavigate={navigate} tareas={tareas} />
          )}

          {activeView === "calificaciones" && <Calificaciones />}

          {activeView === "entrega-archivo" && (
            <EntregaArchivo showToast={showToast} />
          )}

          {activeView === "entrega-enlace" && (
            <EntregaEnlace showToast={showToast} />
          )}

          {activeView === "vista-previa" && <VistaPrevia />}

          {activeView === "notificaciones" && (
            <Notificaciones showToast={showToast} />
          )}
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}