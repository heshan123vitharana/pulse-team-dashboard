import apiClient from "./client";

export interface WeeklyReportCreate {
  project_id: number;
  week_start_date: string;
  week_end_date: string;
  tasks_completed: string;
  tasks_planned: string;
  blockers: string;
  hours_worked?: number | null;
  notes?: string | null;
}

export interface WeeklyReportResponse extends WeeklyReportCreate {
  id: number;
  user_id: number;
  submission_status: string;
  submitted_at: string;
}

/**
 * Submits a new weekly report to the backend.
 * @param data The report payload
 */
export const submitReport = async (data: WeeklyReportCreate): Promise<WeeklyReportResponse> => {
  const response = await apiClient.post<WeeklyReportResponse>("/api/v1/reports/", data);
  return response.data;
};
