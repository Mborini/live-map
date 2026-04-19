import pool from "@/lib/db";

// GET
export async function GET() {
  const res = await pool.query(
    `SELECT * FROM shifts ORDER BY id DESC`,
  );
  return Response.json(res.rows);
}