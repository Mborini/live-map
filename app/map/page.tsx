"use client";

import LiveMap from "../components/map/LiveMap";
import BottomSheet from "../components/map/BottomSheet";
import { useRef } from "react";
import { useSession, signIn } from "next-auth/react";

export default function MapPage() {
  const mapRef = useRef<any>(null);
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <button
          onClick={() => signIn()}
          className="bg-black text-white px-4 py-2"
        >
          Go Login
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <LiveMap mapRef={mapRef} />
      <BottomSheet mapRef={mapRef} />
    </div>
  );
}