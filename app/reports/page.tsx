"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", value: 10 },
  { month: "Feb", value: 20 },
  { month: "Mar", value: 5 },
];

export default function ReportsPage() {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>Reports Chart</h3>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line dataKey="value" stroke="#228be6" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}