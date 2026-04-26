"use client";

import { useEffect, useState, useCallback } from "react";
import { Complaint } from "@/lib/types/complaint";
import ComplaintsList from "../components/complaints/ComplaintsList";
import ComplaintsMap from "../components/complaints/ComplaintsMap";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [focused, setFocused] = useState<Complaint | null>(null);
// app/complaints/page.tsx


  const loadComplaints = async () => {
    const data = await fetch("/api/complaints").then((r) => r.json());
    setComplaints(data);
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  

  // ✅ ثابت reference للـ onSelect
  const handleSelect = useCallback((c: Complaint) => {
    setFocused(c);
  }, []);

  return (
    <div className="w-full h-screen relative">
      <ComplaintsMap
        complaints={complaints}
        focused={focused}
        onSelect={handleSelect}
      />

      <ComplaintsList
        complaints={complaints}
        onFocus={handleSelect}
        focusedId={focused?.id ?? null}
      />
    </div>
  );
}
