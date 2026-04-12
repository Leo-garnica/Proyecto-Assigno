import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import transporter from "@/lib/mailer";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id_docente   = formData.get("id_docente")   as string | null;
    const titulo       = formData.get("titulo")        as string | null;
    const descripcion  = formData.get("descripcion")   as string | null;
    const fecha_limite = formData.get("fecha_limite")  as string | null;
    const notificar    = formData.get("notificar")     as string | null;
    const archivoFile  = formData.get("archivo")       as File   | null;

    if (!id_docente || isNaN(Number(id_docente)))
      return NextResponse.json({ error: "id_docente inválido." }, { status: 400 });
    if (!titulo?.trim())
      return NextResponse.json({ error: "El título es obligatorio." }, { status: 400 });
    if (!fecha_limite)
      return NextResponse.json({ error: "La fecha límite es obligatoria." }, { status: 400 });

    let archivo_nombre: string | null = null;
    let archivo_url:    string | null = null;
    let archivo_tamano: number | null = null;

    if (archivoFile && archivoFile.size > 0) {
      if (archivoFile.type !== "application/pdf")
        return NextResponse.json({ error: "Solo se aceptan archivos PDF." }, { status: 400 });
      if (archivoFile.size > 50 * 1024 * 1024)
        return NextResponse.json({ error: "El archivo supera 50 MB." }, { status: 400 });

      const uploadsDir  = path.join(process.cwd(), "public", "uploads", "tareas");
      await mkdir(uploadsDir, { recursive: true });
      const nombreFinal = `${Date.now()}-${archivoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await writeFile(path.join(uploadsDir, nombreFinal), Buffer.from(await archivoFile.arrayBuffer()));
      archivo_nombre = archivoFile.name;
      archivo_url    = `/uploads/tareas/${nombreFinal}`;
      archivo_tamano = archivoFile.size;
    }

    // US1 - Task Leo: busca o crea el curso "General" automático para el docente
    const [cursosEx] = await db.query(
      `SELECT id_curso FROM Cursos WHERE id_docente = ? AND nombre_curso = 'General' LIMIT 1`,
      [Number(id_docente)]
    ) as [Array<{ id_curso: number }>, unknown];

    let id_curso: number;
    if (cursosEx.length > 0) {
      id_curso = cursosEx[0].id_curso;
    } else {
      const [rc] = await db.query(
        `INSERT INTO Cursos (id_docente, nombre_curso) VALUES (?, 'General')`,
        [Number(id_docente)]
      ) as [{ insertId: number }, unknown];
      id_curso = rc.insertId;
    }

    // US5 - Task Nicole: obtiene todos los estudiantes registrados para inscribirlos y enviarles correo
    const [todosEstudiantes] = await db.query(
      `SELECT id_usuario, correo, nombre_completo FROM Usuarios WHERE rol = 'Estudiante'`
    ) as [Array<{ id_usuario: number; correo: string; nombre_completo: string }>, unknown];

    if (todosEstudiantes.length > 0) {
      const [yaInscritos] = await db.query(
        `SELECT id_estudiante FROM Inscripciones WHERE id_curso = ?`,
        [id_curso]
      ) as [Array<{ id_estudiante: number }>, unknown];

      const idsInscritos = new Set(yaInscritos.map((i) => i.id_estudiante));
      const nuevos = todosEstudiantes.filter((e) => !idsInscritos.has(e.id_usuario));
      if (nuevos.length > 0) {
        await db.query(
          `INSERT INTO Inscripciones (id_curso, id_estudiante) VALUES ?`,
          [nuevos.map((e) => [id_curso, e.id_usuario])]
        );
      }
    }

    // US1 - Task Leo: INSERT en tabla Tareas en BD
    const [resultTarea] = await db.query(
      `INSERT INTO Tareas (id_curso, titulo, descripcion, fecha_limite, archivo_nombre, archivo_url, archivo_tamano)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_curso, titulo.trim(), descripcion?.trim() || null, fecha_limite,
       archivo_nombre, archivo_url, archivo_tamano]
    ) as [{ insertId: number }, unknown];
    const id_tarea = resultTarea.insertId;

    // US1 - Task Leo: crea una fila en Entregas con estado "Asignada" para cada estudiante inscrito
    const [inscritosFinales] = await db.query(
      `SELECT id_estudiante FROM Inscripciones WHERE id_curso = ?`,
      [id_curso]
    ) as [Array<{ id_estudiante: number }>, unknown];

    if (inscritosFinales.length > 0) {
      await db.query(
        `INSERT INTO Entregas (id_tarea, id_estudiante, estado) VALUES ?`,
        [inscritosFinales.map((e) => [id_tarea, e.id_estudiante, "Asignada"])]
      );
    }

    // US5 - Task Leo: configuración del servidor de correo (transporter en lib/mailer.ts)
    // US5 - Task Esteban: plantilla HTML del correo con nombre del curso, título de tarea y fecha límite
    // US5 - Task Reynaldo: trigger que dispara el envío automático al guardar la tarea en BD
    let correosEnviados = 0;
    if (notificar === "true" && todosEstudiantes.length > 0 && process.env.GMAIL_USER) {
      const fechaFormateada = new Date(fecha_limite).toLocaleDateString("es-ES", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });

      const htmlCorreo = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#333">
          <div style="background:#534AB7;padding:24px 28px;border-radius:8px 8px 0 0">
            <h1 style="color:#fff;margin:0;font-size:20px">Assigno — Nueva tarea publicada</h1>
          </div>
          <div style="border:1px solid #e0e0e0;border-top:none;padding:24px 28px;border-radius:0 0 8px 8px">
            <p style="font-size:15px;margin-top:0">Se ha publicado una nueva tarea en tu curso:</p>
            <div style="background:#F5F4FE;border-left:4px solid #534AB7;padding:14px 18px;border-radius:4px;margin:16px 0">
              <p style="margin:0;font-size:17px;font-weight:bold;color:#26215C">${titulo.trim()}</p>
              ${descripcion?.trim() ? `<p style="margin:8px 0 0;font-size:13px;color:#555">${descripcion.trim()}</p>` : ""}
            </div>
            <p style="font-size:14px">
              <strong>Fecha límite:</strong> ${fechaFormateada}
            </p>
            <p style="font-size:12px;color:#888;margin-top:24px">Este correo fue enviado automáticamente por Assigno.</p>
          </div>
        </div>
      `;

      const destinatarios = todosEstudiantes.map((e) => e.correo);

      try {
        await transporter.sendMail({
          from: `"Assigno" <${process.env.GMAIL_USER}>`,
          to: destinatarios.join(", "),
          subject: `Nueva tarea: ${titulo.trim()}`,
          html: htmlCorreo,
        });
        correosEnviados = destinatarios.length;
      } catch (mailErr) {
        console.error("Error al enviar correos:", mailErr);
      }
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Tarea creada correctamente.",
      id_tarea,
      titulo: titulo.trim(),
      fecha_limite,
      estudiantes_asignados: inscritosFinales.length,
      correos_enviados: correosEnviados,
      archivo_nombre,
      archivo_url,
      archivo_tamano,
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("Error en POST /api/tareas:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id_docente    = searchParams.get("id_docente");
    const id_estudiante = searchParams.get("id_estudiante");

    if (id_docente) {
      if (isNaN(Number(id_docente)))
        return NextResponse.json({ error: "id_docente inválido." }, { status: 400 });

      const [tareas] = await db.query(
        `SELECT t.id_tarea, t.titulo, t.descripcion, t.fecha_creacion, t.fecha_limite,
                t.archivo_nombre, t.archivo_url, t.archivo_tamano
         FROM Tareas t
         JOIN Cursos c ON t.id_curso = c.id_curso
         WHERE c.id_docente = ?
         ORDER BY t.fecha_creacion DESC`,
        [Number(id_docente)]
      ) as [Array<{
        id_tarea: number; titulo: string; descripcion: string | null;
        fecha_creacion: string; fecha_limite: string;
        archivo_nombre: string | null; archivo_url: string | null; archivo_tamano: number | null;
      }>, unknown];

      return NextResponse.json({ ok: true, tareas });
    }

    if (id_estudiante) {
      if (isNaN(Number(id_estudiante)))
        return NextResponse.json({ error: "id_estudiante inválido." }, { status: 400 });

      const [tareas] = await db.query(
        `SELECT t.id_tarea, t.titulo, t.descripcion, t.fecha_limite,
                t.archivo_nombre, t.archivo_url, t.archivo_tamano,
                e.id_entrega, e.estado
         FROM Entregas e
         JOIN Tareas t ON e.id_tarea = t.id_tarea
         WHERE e.id_estudiante = ?
         ORDER BY t.fecha_limite ASC`,
        [Number(id_estudiante)]
      ) as [Array<{
        id_tarea: number; titulo: string; descripcion: string | null;
        fecha_limite: string; archivo_nombre: string | null;
        archivo_url: string | null; archivo_tamano: number | null;
        id_entrega: number; estado: string;
      }>, unknown];

      return NextResponse.json({ ok: true, tareas });
    }

    return NextResponse.json({ error: "Parámetro requerido: id_docente o id_estudiante." }, { status: 400 });

  } catch (error: unknown) {
    console.error("Error en GET /api/tareas:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
