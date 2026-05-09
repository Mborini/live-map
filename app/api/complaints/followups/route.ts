import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
     SELECT
  cf.complaint_id        AS id,

  -- ✅ Followup status
  cf.status              AS status_id,
  s.name                 AS status_name,

  -- ✅ Complaint info
  c.description          AS complaint_description,
  c.address,
  c.created_at,
  c.lat,
  c.lng,
  c.image_url,
  c.created_at,
  c.id,

  -- ✅ Type hierarchy
  t.name                 AS type_name,
  st.name                AS sub_type_name,

  -- ✅ Zone / shift / supervisor
  z.name                 AS zone_name,
  sh.name                AS shift_name,
  sp.name                AS supervisor_name,

  -- ✅ User
  u.username,

  -- ✅ Followup
  cf.description         AS followup_description,
  cf.updated_at

FROM complaint_followup cf
JOIN complaints c              ON cf.complaint_id = c.id
JOIN complaint_statuses s      ON cf.status = s.id

JOIN types t                   ON c.type = t.id
JOIN subtypes st               ON c.sub_type = st.id

LEFT JOIN users u              ON c.user_id = u.id
LEFT JOIN zones z              ON c.zone_id = z.id
LEFT JOIN shifts sh            ON z.shift_id = sh.id
LEFT JOIN supervisors sp       ON z.supervisor_id = sp.id

ORDER BY cf.updated_at DESC;
    `);

    return Response.json(result.rows);

  } catch (err) {
    console.error(err);
    return Response.json([], { status: 200 });
  }
}