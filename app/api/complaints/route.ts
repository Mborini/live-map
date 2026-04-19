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
console.log("body", body);  
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