import pool from "@/lib/db";

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const { complaintId, status, description, userId } = await req.json();

    if (!complaintId || !status) {
      return Response.json({ error: "Missing data" }, { status: 400 });
    }

    await client.query("BEGIN");

    // ✅ إذا الحالة = جديد
    if (status === 1) {
      // 1) تحديث البلاغ
      await client.query(
        `UPDATE complaints SET status = 1 WHERE id = $1`,
        [complaintId]
      );

      // 2) حذف المتابعة
      await client.query(
        `DELETE FROM complaint_followup WHERE complaint_id = $1`,
        [complaintId]
      );

      await client.query("COMMIT");
      return Response.json({ success: true, removed: true });
    }

    // ✅ إذا أي حالة أخرى
    await client.query(
      `UPDATE complaints SET status = $1 WHERE id = $2`,
      [status, complaintId]
    );

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
      [complaintId, status, description ?? null, userId ?? null]
    );

    await client.query("COMMIT");
    return Response.json({ success: true });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return Response.json({ error: "Failed" }, { status: 500 });
  } finally {
    client.release();
  }
}