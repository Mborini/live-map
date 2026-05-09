import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `DELETE FROM bins WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Bin not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bin:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}