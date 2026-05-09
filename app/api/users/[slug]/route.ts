import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const client = await pool.connect();

  try {
    const { slug } = await params;
    const { password, is_active, role } = await req.json();

    await client.query("BEGIN");

    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (password) {
      fields.push(`password = $${i++}`);
      values.push(await bcrypt.hash(password, 10));
    }

    if (is_active !== undefined) {
      fields.push(`is_active = $${i++}`);
      values.push(is_active);
    }

    if (role !== undefined) {
      fields.push(`role = $${i++}`);
      values.push(role);
    }

    if (!fields.length) {
      return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
    }

    values.push(slug);

    const result = await client.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${i}
       RETURNING id, username AS name, role, is_active`,
      values
    );

    await client.query("COMMIT");
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // ✅ فك الـ Promise
    const { slug } = await params;
    const id = slug;

    if (!id) {
      return NextResponse.json(
        { message: "User ID required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      UPDATE users
      SET is_deleted = TRUE
      WHERE id = $1
        AND is_deleted = FALSE
      RETURNING id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "User not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}