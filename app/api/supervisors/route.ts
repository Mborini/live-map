import pool from "@/lib/db";

// GET
export async function GET() {
  const res = await pool.query(
    `SELECT supervisors.* 
     FROM supervisors
     ORDER BY supervisors.id DESC`,
  );
  return Response.json(res.rows);
}

// POST
export async function POST(req: Request) {
  const body = await req.json();

  await pool.query(
    "INSERT INTO supervisors (name, phone) VALUES ($1, $2)",
    [body.name, body.phone],
  );

  return Response.json({ success: true });
}

