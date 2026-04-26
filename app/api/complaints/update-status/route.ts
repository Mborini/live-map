import pool from "@/lib/db";

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const { complaintId, status, description, userId } = body;

    // ✅ تحقق من البيانات
    if (!complaintId || !status || !description) {
      return Response.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // ❌ منع الحالة 1 (جديد)
    if (status === 1) {
      return Response.json(
        { error: "Cannot change to NEW status" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // 1️⃣ تحديث حالة البلاغ
    await client.query(
      `UPDATE complaints SET status = $1 WHERE id = $2`,
      [status, complaintId]
    );

    // 2️⃣ إدخال أو تعديل الفولو أب (Row واحد فقط)
    await client.query(
      `
      INSERT INTO complaint_followup
        (complaint_id, status, description, updated_by, updated_at)
      VALUES
        ($1, $2, $3, $4, NOW())
      ON CONFLICT (complaint_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        description = EXCLUDED.description,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW()
      `,
      [complaintId, status, description, userId ?? null]
    );

    await client.query("COMMIT");

    return Response.json({ success: true });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update status error:", err);

    return Response.json(
      { error: "Failed to update complaint status" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}