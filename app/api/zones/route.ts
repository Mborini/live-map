import pool from "@/lib/db";

// GET ALL ZONES
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        z.id,
        z.name,
        z.geometry,
        z.supervisor_id,
        s.name AS supervisor_name,
        s.phone
      FROM zones z
      JOIN supervisors s ON s.id = z.supervisor_id
      ORDER BY z.id DESC
    `);

    return Response.json(result.rows);
  } catch (err) {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}

// CREATE ZONE
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { supervisor_id, geometry, name } = body;

    const result = await pool.query(
      `
      INSERT INTO zones (supervisor_id, geometry, name)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [supervisor_id, JSON.stringify(geometry), name]
    );

    return Response.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return Response.json({ success: false }, { status: 500 });
  }
}