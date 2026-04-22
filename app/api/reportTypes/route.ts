import pool from "@/lib/db";

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT 
        t.id,
        t.name,
        t.code,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'code', s.code
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS subtypes
      FROM types t
      LEFT JOIN subtypes s 
        ON s.typeid = t.id
      WHERE t.isactive = true
      GROUP BY t.id
      ORDER BY t.id;
    `);

    return Response.json(res.rows);
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
}