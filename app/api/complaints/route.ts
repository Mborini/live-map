import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      type,
      subType,
      description,

      coords,
      address,
      createdAt,
      user_id,
      zone_id,
      image_url,
    } = body;

    const result = await pool.query(
      `
      INSERT INTO complaints
      (
        type,
        sub_type,
        description,
        image_url,

        lng,
        lat,
        address,
        zone_id,
        created_at,
        user_id,
        status
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
     [
  type,
  subType,
  description,
  image_url,
  coords?.lng ?? null,
  coords?.lat ?? null,
  address,
  zone_id, // ✅ أضف الفاصلة
  createdAt ?? new Date(),
  user_id ?? null,
  1,
]
    );
    const row = result.rows[0];

    // ✅ FIX: حل مشكلة JSON serialization (BigInt / Date)
    return Response.json(JSON.parse(JSON.stringify(row)));
  } catch (err) {
    console.error("Error creating complaint:", err);

    return new Response(
      JSON.stringify({ error: "Failed to create complaint" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
export async function GET() {
  try {
    const result = await pool.query(`
SELECT
  c.id,
  c.description,
  c.address,
  c.created_at,
  c.lng,
  c.lat,
  c.image_url,

  t.name  AS type_name,
  st.name AS sub_type_name,
  sh.name AS shift_name,

  c.status AS status_id,
  cs.name AS status_name,

  u.username AS username,

  z.name AS zone_name,
  s.name AS supervisor_name

FROM complaints c

LEFT JOIN users u               ON c.user_id = u.id
LEFT JOIN complaint_statuses cs ON c.status = cs.id
LEFT JOIN types t               ON c.type = t.id
LEFT JOIN subtypes st           ON c.sub_type = st.id

LEFT JOIN zones z               ON c.zone_id = z.id
LEFT JOIN shifts sh             ON z.shift_id = sh.id
LEFT JOIN supervisors s         ON z.supervisor_id = s.id

WHERE c.status = 1
ORDER BY c.created_at DESC;
`);

    const rows = result.rows.map((r: any) => ({
      ...r,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : null,
    }));

    return Response.json(rows);
  } catch (err: any) {
    console.error("Error fetching complaints:", err);

    // ✅ رجّع رسالة واضحة تساعدك
    return Response.json(
      {
        error: "Failed to fetch complaints",
        message: err?.message ?? String(err),
      },
      { status: 500 },
    );
  }
}
