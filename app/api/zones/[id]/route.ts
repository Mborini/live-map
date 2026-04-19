import pool from "@/lib/db";

// GET SINGLE
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await pool.query(
    `
    SELECT 
      z.id,
      z.name,
      z.geometry,
      z.supervisor_id,
      s.name AS supervisor_name
    FROM zones z
    JOIN supervisors s ON s.id = z.supervisor_id
    WHERE z.id = $1
    `,
    [id]
  );

  return Response.json(result.rows[0]);
}

// UPDATE
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const { name, supervisor_id, geometry } = body;

  const result = await pool.query(
    `
    UPDATE zones
    SET name=$1,
        supervisor_id=$2,
        geometry=$3
    WHERE id=$4
    RETURNING *
    `,
    [name, supervisor_id, JSON.stringify(geometry), id]
  );

  return Response.json({ success: true, data: result.rows[0] });
}

// DELETE
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await pool.query(`DELETE FROM zones WHERE id=$1`, [id]);

  return Response.json({ success: true });
}