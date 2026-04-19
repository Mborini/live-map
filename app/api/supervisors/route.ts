import pool from "@/lib/db";

// GET
export async function GET() {
  const res = await pool.query(
    `SELECT supervisors.*, shifts.name AS shift
     FROM supervisors
     INNER JOIN shifts ON shifts.id = supervisors.shift
     ORDER BY supervisors.id DESC`,
  );
  return Response.json(res.rows);
}

// POST
export async function POST(req: Request) {
  const body = await req.json();

  await pool.query(
    "INSERT INTO supervisors (name, phone, shift) VALUES ($1, $2, $3)",
    [body.name, body.phone, body.shift],
  );

  return Response.json({ success: true });
}

// PATCH
export async function PATCH(req: Request) {
  const body = await req.json();

  await pool.query("UPDATE supervisors SET active=$1 WHERE id=$2", [
    body.active,
    body.id,
  ]);

  return Response.json({ success: true });
}
