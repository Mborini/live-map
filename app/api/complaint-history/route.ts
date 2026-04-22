import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { complaintId, status, description, userId } = await req.json();

    if (!complaintId || !status || !description || !userId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO complaint_history
      (complaint_id, user_id, description, new_status_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    const values = [complaintId, userId, description, status];

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      historyId: result.rows[0].id,
    });
  } catch (error) {
    console.error("Complaint history insert error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}