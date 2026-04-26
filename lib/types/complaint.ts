export type ComplaintStatus = "new" | "in_progress" | "closed";

export type Complaint = {
  id: number;
  title: string;
  description: string;
  status: ComplaintStatus;
  lat: number;
  lng: number;
  created_at: string;
  status_name: string;
  type_name: string;
  user_id?: number;
  address?: string;
  supervisor_id?: number;
  supervisor_name?: string;
  username?: string;
  status_id: number;
};