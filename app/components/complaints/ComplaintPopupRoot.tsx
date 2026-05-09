"use client";

import { MantineProvider } from "@mantine/core";
import { ComplaintPopup } from "./ComplaintPopup";
import { Complaint } from "@/lib/types/complaint";

export function ComplaintPopupRoot({
  complaint,
}: {
  complaint: Complaint;
}) {
  return (
    <MantineProvider>
      <ComplaintPopup complaint={complaint} />
    </MantineProvider>
  );
}