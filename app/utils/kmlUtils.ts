// utils/kmlUtils.ts
import * as toGeoJSON from "@tmcw/togeojson";

export const parseKmlToGeoJSON = (kmlText: string) => {
  const parser = new DOMParser();
  const kml = parser.parseFromString(kmlText, "text/xml");

  return toGeoJSON.kml(kml);
};