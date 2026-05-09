import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
// 📥 GET USERS
export async function GET() {
  try {
    const result = await pool.query(`
    SELECT
  u.id,
  u.username AS name,
  u.is_active,
  u.role AS role_id,
  r.name AS role_name
FROM users u
LEFT JOIN roles r ON u.role = r.id
WHERE u.is_deleted = FALSE
ORDER BY u.id DESC;

    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

// ➕ CREATE USER
export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const { name, role, password } = await req.json();

    if (!name || !role || !password) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO users (username, role, password, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING id, username AS name, role, is_active`,
      [name, role, hashed]
    );

    await client.query("COMMIT");

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");

    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}