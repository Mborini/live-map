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
        
zone_shift_id
,
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
    const result = await pool.query(`SELECT
  c.id,
  c.description,
  c.address,
  c.created_at,
  c.lng,
  c.lat,

  -- type / subtype
  t.name  AS type_name,
  st.name AS sub_type_name,

  -- shift
  sh.name AS shift_name,

  -- zone
  z.name AS zone_name,

  -- supervisor
  sp.id   AS supervisor_id,
  sp.name AS supervisor_name,

  -- status
  c.status AS status_id,
  cs.name  AS status_name,

  -- user
  u.username AS username

FROM complaints c

LEFT JOIN users u              ON c.user_id = u.id
LEFT JOIN complaint_statuses cs ON c.status = cs.id
LEFT JOIN types t              ON c.type = t.id
LEFT JOIN subtypes st          ON c.sub_type = st.id
LEFT JOIN shifts sh            ON c.shift = sh.id

-- ✅ الربط الصحيح
LEFT JOIN zone_shifts zs       ON c.zone_shift_id = zs.id
LEFT JOIN zones z              ON zs.zone_id = z.id
LEFT JOIN supervisors sp       ON zs.supervisor_id = sp.id

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
