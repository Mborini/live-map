"use client";

import BottomSheet from "./components/BottomSheet";
import LiveMap from "./components/LiveMap";
import { useRef } from "react";

export default function Home() {
  const mapRef = useRef<any>(null);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <LiveMap mapRef={mapRef} />
      <BottomSheet mapRef={mapRef} />
    </div>
  );
}