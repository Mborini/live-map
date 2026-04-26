import pool from "@/lib/db";

// ✅ GET ALL ZONES
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        z.id,
        z.name,
        z.geometry,
        z.supervisor_id,
        s.name AS supervisor_name,
        z.shift_id,
        sh.name AS shift_name
      FROM zones z
      JOIN supervisors s ON s.id = z.supervisor_id
      JOIN shifts sh ON sh.id = z.shift_id
      ORDER BY z.id DESC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch zones" }, { status: 500 });
  }
}

// ✅ CREATE ZONE
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, supervisor_id, geometry, shift } = body;

    const result = await pool.query(
      `
      INSERT INTO zones (name, supervisor_id, geometry, shift_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        name,
        supervisor_id,
        JSON.stringify(geometry),
        shift,
      ]
    );

    return Response.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false }, { status: 500 });
  }
}
``