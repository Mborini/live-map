import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(
    `SELECT id, name, points
FROM bins
WHERE points IS NOT NULL
  AND jsonb_array_length(points) > 0
ORDER BY id DESC;`
  );

  return NextResponse.json(result.rows);
}


export async function POST(req: Request) {
  const formData = await req.formData();
  const name = formData.get("name");
  const file = formData.get("file");

  if (!name || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const kmlText = await file.text();

  const coordinatesMatches = [
    ...kmlText.matchAll(/<coordinates>(.*?)<\/coordinates>/g),
  ];

  const points = coordinatesMatches.flatMap(match =>
    match[1]
      .trim()
      .split(/\s+/)
      .map(coord => {
        const [lng, lat] = coord.split(",").map(Number);
        return { lat, lng };
      })
  );

  await pool.query(
    `INSERT INTO bins (name, points)
     VALUES ($1, $2)`,
    [name, JSON.stringify(points)]
  );

  return NextResponse.json({
    success: true,
    points,
  });
}
