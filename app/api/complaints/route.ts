import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      type,
      subType,
      description,
      shift,
      coords,
      address,
      supervisorZoneId,
      createdAt,
      user_id,
    } = body;
   ;
    const result = await pool.query(
      `
      INSERT INTO complaints
      (
        type,
        sub_type,
        description,
        shift,
        lng,
        lat,
        address,
        supervisor_zone_id,
        created_at,
        user_id,
        status
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10 ,$11)
      RETURNING *
      `,
      [
        type,
        subType,
        description,
        shift,
        coords?.lng ?? null,
        coords?.lat ?? null,
        address,
        supervisorZoneId,
        createdAt ?? new Date().toISOString(),
        user_id ?? null,
        1, // default status (pending)
      ],
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
  t.name  AS type_name,
  st.name AS sub_type_name,
  c.description,
  sh.name AS shift_name,
  sz.name AS zoneName,

  -- بيانات السوبرفايزر
  sp.id   AS supervisor_id,
  sp.name AS supervisor_name,
c.lng,
c.lat,
  c.user_id,
  c.status AS status_id,
  s.name AS status_name,
  c.address,
  c.created_at,
  c.lng,
  c.lat,
  c.id,
  u.username AS username
FROM complaints c
LEFT JOIN users u               ON c.user_id = u.id
LEFT JOIN complaint_statuses s  ON c.status = s.id
LEFT JOIN types t               ON c.type = t.id
LEFT JOIN subtypes st           ON c.sub_type = st.id
LEFT JOIN shifts sh             ON c.shift = sh.id

-- ربط الشكوى بالزون
LEFT JOIN zones sz              ON c.supervisor_zone_id = sz.id

-- ربط الزون بالسوبرفايزر
LEFT JOIN supervisors sp        ON sz.supervisor_id = sp.id

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
      { status: 500 }
    );
  }
}
