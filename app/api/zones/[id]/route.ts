import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/* ===============================
   ✅ GET SINGLE ZONE
================================ */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      SELECT 
        z.id,
        z.name,
        z.geometry,
        z.supervisor_id,
        s.name AS supervisor_name,
        z.shift_id,
        sh.name AS shift_name
      FROM zones z
      JOIN supervisors s ON s.id = z.supervisor_id
      JOIN shifts sh ON sh.id = z.shift_id
      WHERE z.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Zone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("GET zone error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* ===============================
   ✅ UPDATE ZONE
================================ */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, supervisor_id, geometry, shift_id } = body;

    if (!name || !supervisor_id || !geometry || !shift_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      UPDATE zones
      SET
        name = $1,
        supervisor_id = $2,
        geometry = $3,
        shift_id = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
      `,
      [
        name,
        supervisor_id,
        JSON.stringify(geometry),
        shift_id,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Zone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE zone error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* ===============================
   ✅ DELETE ZONE
================================ */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `DELETE FROM zones WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Zone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE zone error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}