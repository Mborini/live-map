import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
  cf.complaint_id        AS id,
  cf.status              AS status_id,   -- ✅ هذا المهم
  t.name                 AS type_name,
  c.description          AS complaint_description,
  s.name                 AS status_name,
  cf.description         AS followup_description,
  cf.updated_at
FROM complaint_followup cf
JOIN complaints c          ON cf.complaint_id = c.id
JOIN types t               ON c.type = t.id
JOIN complaint_statuses s  ON cf.status = s.id
ORDER BY cf.updated_at DESC;
    `);

    return Response.json(result.rows);

  } catch (err) {
    console.error(err);
    return Response.json([], { status: 200 });
  }
}