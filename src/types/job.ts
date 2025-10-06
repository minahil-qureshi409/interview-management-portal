export interface Job {
  id: number; // or string, depending on your DB
  title: string;
  department: string;
  description: string;
  requirements: string;
}
