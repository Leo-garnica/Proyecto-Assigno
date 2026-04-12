import { NextResponse } from "next/server";
import db from "@/lib/db";

/**
 * GET /api/init
 *
 * Ejecuta las migraciones necesarias y crea los usuarios demo si no existen.
 * Llamar una vez al arrancar el proyecto (o desde el README).
 *
 * Usuarios demo:
 *  id=1  docente@assigno.dev  rol=Docente
 *  id=2  estudiante@assigno.dev  rol=Estudiante
 */
export async function GET() {
  const log: string[] = [];

  try {
    // ── 1. Tablas base (idempotentes) ────────────────────────────────────────
    await db.query(`
      CREATE TABLE IF NOT EXISTS Usuarios (
        id_usuario INT AUTO_INCREMENT PRIMARY KEY,
        nombre_completo VARCHAR(100) NOT NULL,
        correo VARCHAR(100) UNIQUE NOT NULL,
        contrasena_hash VARCHAR(255) NOT NULL,
        rol ENUM('Docente','Estudiante') NOT NULL
      )
    `);
    log.push("✅ Tabla Usuarios");

    await db.query(`
      CREATE TABLE IF NOT EXISTS Cursos (
        id_curso INT AUTO_INCREMENT PRIMARY KEY,
        id_docente INT NOT NULL,
        nombre_curso VARCHAR(100) NOT NULL,
        codigo_acceso VARCHAR(20) UNIQUE,
        FOREIGN KEY (id_docente) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
      )
    `);
    log.push("✅ Tabla Cursos");

    await db.query(`
      CREATE TABLE IF NOT EXISTS Inscripciones (
        id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
        id_curso INT NOT NULL,
        id_estudiante INT NOT NULL,
        fecha_union DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso) ON DELETE CASCADE,
        FOREIGN KEY (id_estudiante) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
      )
    `);
    log.push("✅ Tabla Inscripciones");

    await db.query(`
      CREATE TABLE IF NOT EXISTS Tareas (
        id_tarea INT AUTO_INCREMENT PRIMARY KEY,
        id_curso INT NOT NULL,
        titulo VARCHAR(150) NOT NULL,
        descripcion TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_limite DATETIME NOT NULL,
        archivo_nombre VARCHAR(255) DEFAULT NULL,
        archivo_url VARCHAR(500) DEFAULT NULL,
        archivo_tamano INT DEFAULT NULL,
        FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso) ON DELETE CASCADE
      )
    `);
    log.push("✅ Tabla Tareas");

    // Migracion: agregar columnas archivo_* si ya existia la tabla sin ellas
    const alterColumns = [
      ["archivo_nombre", "VARCHAR(255) DEFAULT NULL AFTER fecha_limite"],
      ["archivo_url",    "VARCHAR(500) DEFAULT NULL AFTER archivo_nombre"],
      ["archivo_tamano", "INT DEFAULT NULL AFTER archivo_url"],
    ];
    for (const [col, def] of alterColumns) {
      try {
        await db.query(`ALTER TABLE Tareas ADD COLUMN ${col} ${def}`);
        log.push(`✅ Columna Tareas.${col} agregada`);
      } catch {
        log.push(`↩ Columna Tareas.${col} ya existe`);
      }
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS Entregas (
        id_entrega INT AUTO_INCREMENT PRIMARY KEY,
        id_tarea INT NOT NULL,
        id_estudiante INT NOT NULL,
        estado ENUM('Asignada','Entregada','Con_retraso','Calificada') DEFAULT 'Asignada',
        fecha_entrega DATETIME DEFAULT NULL,
        calificacion DECIMAL(5,2) DEFAULT NULL CHECK (calificacion >= 0 AND calificacion <= 100),
        comentarios TEXT DEFAULT NULL,
        FOREIGN KEY (id_tarea) REFERENCES Tareas(id_tarea) ON DELETE CASCADE,
        FOREIGN KEY (id_estudiante) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
      )
    `);
    log.push("✅ Tabla Entregas");

    await db.query(`
      CREATE TABLE IF NOT EXISTS Materiales_Adjuntos (
        id_adjunto INT AUTO_INCREMENT PRIMARY KEY,
        id_entrega INT NOT NULL,
        tipo_material ENUM('Archivo','Enlace') NOT NULL,
        ruta_o_url VARCHAR(500) NOT NULL,
        nombre_original VARCHAR(255) DEFAULT NULL,
        tamano_bytes INT DEFAULT NULL,
        FOREIGN KEY (id_entrega) REFERENCES Entregas(id_entrega) ON DELETE CASCADE
      )
    `);
    log.push("✅ Tabla Materiales_Adjuntos");

    // ── 2. Usuarios demo ─────────────────────────────────────────────────────
    // Docente demo (id_usuario = 1)
    const [docenteRows] = await db.query(
      `SELECT id_usuario FROM Usuarios WHERE correo = 'docente@assigno.dev'`
    ) as [Array<{ id_usuario: number }>, unknown];

    if (docenteRows.length === 0) {
      await db.query(
        `INSERT INTO Usuarios (nombre_completo, correo, contrasena_hash, rol)
         VALUES ('Docente Demo', 'docente@assigno.dev', 'demo_hash', 'Docente')`
      );
      log.push("✅ Usuario Docente Demo creado");
    } else {
      log.push(`↩ Docente Demo ya existe (id=${docenteRows[0].id_usuario})`);
    }

    // Estudiante demo (id_usuario = 2)
    const [estudianteRows] = await db.query(
      `SELECT id_usuario FROM Usuarios WHERE correo = 'estudiante@assigno.dev'`
    ) as [Array<{ id_usuario: number }>, unknown];

    if (estudianteRows.length === 0) {
      await db.query(
        `INSERT INTO Usuarios (nombre_completo, correo, contrasena_hash, rol)
         VALUES ('Estudiante Demo', 'estudiante@assigno.dev', 'demo_hash', 'Estudiante')`
      );
      log.push("✅ Usuario Estudiante Demo creado");
    } else {
      log.push(`↩ Estudiante Demo ya existe (id=${estudianteRows[0].id_usuario})`);
    }

    // Verificar IDs reales
    const [allUsers] = await db.query(
      `SELECT id_usuario, nombre_completo, correo, rol FROM Usuarios ORDER BY id_usuario`
    ) as [Array<{ id_usuario: number; nombre_completo: string; correo: string; rol: string }>, unknown];

    return NextResponse.json({ ok: true, log, usuarios: allUsers });
  } catch (error: unknown) {
    console.error("/api/init error:", error);
    return NextResponse.json({ ok: false, error: String(error), log }, { status: 500 });
  }
}
