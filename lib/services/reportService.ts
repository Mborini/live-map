import { Shift } from "../types/shiftTypes";

const API_URL = "/api/shifts";

// جلب جميع الشفتات
export async function getShifts(): Promise<Shift[]> {
  const res = await fetch(API_URL);

  if (!res.ok) throw new Error("فشل في جلب الشفتات");

  return res.json();
}
