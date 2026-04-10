import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "Assigno - Gestión de tareas",
  description: "Panel de control de tareas para estudiantes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
