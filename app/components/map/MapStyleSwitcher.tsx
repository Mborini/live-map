import { FaMap } from "react-icons/fa";

interface MapStyleSwitcherProps {
  currentStyleIndex: number;
  onSwitch: () => void;
}

const labels = ["Streets", "Satellite", "Outdoors"];

export default function MapStyleSwitcher({
  currentStyleIndex,
  onSwitch,
}: MapStyleSwitcherProps) {
  return (
    <button
      onClick={onSwitch}
      className="absolute top-60 right-2  z-10 bg-white px-2 py-2 rounded-md shadow-lg"
    >
    <FaMap />
    </button>
  );
}
