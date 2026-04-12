import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { put } from "@vercel/blob";

// US2 - Task Leo: GET devuelve entregas recibidas para que el docente pueda calificarlas
// US4 - Task Leo: GET devuelve calificaciones y comentarios del estudiante autenticado
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id_docente    = searchParams.get("id_docente");
    const id_estudiante = searchParams.get("id_estudiante");

    if (id_docente) {
      const [rows] = await db.query(
        `SELECT e.id_entrega, e.id_tarea, e.id_estudiante,
                e.estado, e.fecha_entrega, e.calificacion, e.comentarios,
                u.nombre_completo AS nombre_estudiante,
                t.titulo AS titulo_tarea,
                ma.ruta_o_url, ma.nombre_original, ma.tipo_material
         FROM Entregas e
         JOIN Usuarios u ON e.id_estudiante = u.id_usuario
         JOIN Tareas   t ON e.id_tarea = t.id_tarea
         JOIN Cursos   c ON t.id_curso = c.id_curso
         LEFT JOIN Materiales_Adjuntos ma ON ma.id_entrega = e.id_entrega
         WHERE c.id_docente = ?
           AND e.estado IN ('Entregada','Con_retraso','Calificada')
         ORDER BY e.fecha_entrega DESC`,
        [Number(id_docente)]
      ) as [Array<{
        id_entrega: number; id_tarea: number; id_estudiante: number;
        estado: string; fecha_entrega: string | null;
        calificacion: number | null; comentarios: string | null;
        nombre_estudiante: string; titulo_tarea: string;
        ruta_o_url: string | null; nombre_original: string | null;
        tipo_material: string | null;
      }>, unknown];

      return NextResponse.json({ ok: true, entregas: rows });
    }

    if (id_estudiante) {
      const [rows] = await db.query(
        `SELECT e.id_entrega, e.id_tarea, e.estado,
                e.fecha_entrega, e.calificacion, e.comentarios,
                t.titulo AS titulo_tarea,
                t.fecha_limite
         FROM Entregas e
         JOIN Tareas t ON e.id_tarea = t.id_tarea
         WHERE e.id_estudiante = ?
         ORDER BY e.fecha_entrega DESC`,
        [Number(id_estudiante)]
      ) as [Array<{
        id_entrega: number; id_tarea: number; estado: string;
        fecha_entrega: string | null; calificacion: number | null;
        comentarios: string | null; titulo_tarea: string; fecha_limite: string;
      }>, unknown];

      return NextResponse.json({ ok: true, entregas: rows });
    }

    return NextResponse.json({ error: "Parámetro requerido." }, { status: 400 });
  } catch (error) {
    console.error("GET /api/entregas error:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

// US6 - Task Nicole: sube el archivo al almacenamiento y guarda su ruta en BD
// US6 - Task Reynaldo: registra fecha/hora y evalúa si el estado es "Entregada" o "Con_retraso"
// US7 - Task Nicole: inserta el enlace en Materiales_Adjuntos y cambia estado de la entrega a "Entregado"
export async function POST(req: NextRequest) {
  try {
    const formData   = await req.formData();
    const id_entrega = formData.get("id_entrega") as string | null;
    const tipo       = formData.get("tipo") as string | null;
    const enlaceUrl  = formData.get("url") as string | null;
    const archivo    = formData.get("archivo") as File | null;

    if (!id_entrega || isNaN(Number(id_entrega))) {
      return NextResponse.json({ error: "id_entrega inválido." }, { status: 400 });
    }
    if (!tipo || !["archivo", "enlace"].includes(tipo)) {
      return NextResponse.json({ error: "tipo debe ser 'archivo' o 'enlace'." }, { status: 400 });
    }

    const [rows] = await db.query(
      `SELECT id_entrega, estado, id_tarea,
              (SELECT fecha_limite FROM Tareas WHERE id_tarea = e.id_tarea) AS fecha_limite
       FROM Entregas e WHERE id_entrega = ?`,
      [Number(id_entrega)]
    ) as [Array<{ id_entrega: number; estado: string; id_tarea: number; fecha_limite: string }>, unknown];

    if (rows.length === 0) {
      return NextResponse.json({ error: "Entrega no encontrada." }, { status: 404 });
    }
    const entrega = rows[0];

    if (!["Asignada", "Sin_entregar"].includes(entrega.estado)) {
      return NextResponse.json({ error: "Solo puedes entregar tareas en estado Asignada o Sin entregar." }, { status: 400 });
    }

    const ahora       = new Date();
    const fechaLimite = new Date(entrega.fecha_limite);
    const nuevoEstado = ahora <= fechaLimite ? "Entregada" : "Con_retraso";

    let ruta_o_url    = "";
    let nombre_original: string | null = null;
    let tamano_bytes: number | null = null;
    let tipo_material: "Archivo" | "Enlace" = "Enlace";

    if (tipo === "enlace") {
      if (!enlaceUrl?.trim()) {
        return NextResponse.json({ error: "URL requerida." }, { status: 400 });
      }
      ruta_o_url    = enlaceUrl.trim();
      tipo_material = "Enlace";
    } else {
      if (!archivo || archivo.size === 0) {
        return NextResponse.json({ error: "Archivo requerido." }, { status: 400 });
      }

      const blob = await put(
        `entregas/${Date.now()}-${archivo.name}`,
        archivo,
        { access: "public" }
      );
      ruta_o_url      = blob.url;
      nombre_original = archivo.name;
      tamano_bytes    = archivo.size;
      tipo_material   = "Archivo";
    }

    await db.query(
      `UPDATE Entregas SET estado = ?, fecha_entrega = ? WHERE id_entrega = ?`,
      [nuevoEstado, ahora, Number(id_entrega)]
    );

    await db.query(
      `INSERT INTO Materiales_Adjuntos (id_entrega, tipo_material, ruta_o_url, nombre_original, tamano_bytes)
       VALUES (?, ?, ?, ?, ?)`,
      [Number(id_entrega), tipo_material, ruta_o_url, nombre_original, tamano_bytes]
    );

    return NextResponse.json({
      ok: true,
      estado: nuevoEstado,
      fecha_entrega: ahora.toISOString(),
      ruta_o_url,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/entregas error:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

// US2 - Task Esteban: validación backend rango 0–100
// US2 - Task Brenda: UPDATE en tabla Entregas con calificación, comentarios y estado "Calificada"
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_entrega, calificacion, comentarios } = body as {
      id_entrega: number;
      calificacion: number;
      comentarios?: string;
    };

    if (!id_entrega || isNaN(Number(id_entrega))) {
      return NextResponse.json({ error: "id_entrega inválido." }, { status: 400 });
    }
    if (calificacion === undefined || calificacion === null || isNaN(Number(calificacion))) {
      return NextResponse.json({ error: "Calificación inválida." }, { status: 400 });
    }
    const nota = Number(calificacion);
    if (nota < 0 || nota > 100) {
      return NextResponse.json({ error: "La calificación debe estar entre 0 y 100." }, { status: 400 });
    }

    const [rows] = await db.query(
      `SELECT estado FROM Entregas WHERE id_entrega = ?`,
      [Number(id_entrega)]
    ) as [Array<{ estado: string }>, unknown];

    if (rows.length === 0) {
      return NextResponse.json({ error: "Entrega no encontrada." }, { status: 404 });
    }
    if (!["Entregada", "Con_retraso"].includes(rows[0].estado)) {
      return NextResponse.json({ error: "Solo se pueden calificar entregas con estado Entregada o Con retraso." }, { status: 400 });
    }

    await db.query(
      `UPDATE Entregas SET calificacion = ?, comentarios = ?, estado = 'Calificada' WHERE id_entrega = ?`,
      [nota, comentarios ?? null, Number(id_entrega)]
    );

    return NextResponse.json({ ok: true, calificacion: nota, estado: "Calificada" });
  } catch (error) {
    console.error("PATCH /api/entregas error:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
