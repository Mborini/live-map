import pool from "@/lib/db";

// ✅ GET SINGLE ZONE
export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const result = await pool.query(
    `
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
    WHERE z.id = $1
    `,
    [id]
  );

  if (!result.rows.length) {
    return Response.json({ error: "Zone not found" }, { status: 404 });
  }

  return Response.json(result.rows[0]);
}

// ✅ UPDATE ZONE
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();

  const { name, supervisor_id, geometry, shift } = body;

  const result = await pool.query(
    `
    UPDATE zones
    SET
      name = $1,
      supervisor_id = $2,
      geometry = $3,
      shift_id = $4
    WHERE id = $5
    RETURNING *
    `,
    [
      name,
      supervisor_id,
      JSON.stringify(geometry),
      shift,
      id,
    ]
  );

  return Response.json({
    success: true,
    data: result.rows[0],
  });
}

// ✅ DELETE ZONE
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  await pool.query(`DELETE FROM zones WHERE id = $1`, [id]);

  return Response.json({ success: true });
}