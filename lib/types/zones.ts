export type Supervisor = {
  id: number;
  name: string;
};

export type Zone = {
  id: number;
  name: string;
  geometry: any;
  supervisor_id: number;
  supervisor_name: string;
  shift_id: number;
  shift_name: string;
};