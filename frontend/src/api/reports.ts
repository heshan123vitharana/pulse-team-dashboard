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

export type WeeklyReportUpdate = Partial<WeeklyReportCreate>;

export interface WeeklyReportResponse extends WeeklyReportCreate {
  id: number;
  user_id: number;
  submission_status: string;
  submitted_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role_id: number;
  };
  project?: {
    id: number;
    project_name: string;
  };
}

export interface ReportFilters {
  project_id?: number;
  start_date?: string;
  end_date?: string;
}

/**
 * Submits a new weekly report to the backend.
 * @param data The report payload
 */
export const submitReport = async (data: WeeklyReportCreate): Promise<WeeklyReportResponse> => {
  const response = await apiClient.post<WeeklyReportResponse>("/api/v1/reports/", data);
  return response.data;
};

/**
 * Updates an existing weekly report.
 */
export const updateReport = async (id: number, data: WeeklyReportUpdate): Promise<WeeklyReportResponse> => {
  const response = await apiClient.put<WeeklyReportResponse>(`/api/v1/reports/${id}`, data);
  return response.data;
};

/**
 * Deletes a weekly report.
 */
export const deleteReport = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/v1/reports/${id}`);
};

/**
 * Fetches a single report by ID.
 */
export const getReport = async (id: number): Promise<WeeklyReportResponse> => {
  const response = await apiClient.get<WeeklyReportResponse>(`/api/v1/reports/${id}`);
  return response.data;
};

/**
 * Fetches all reports submitted by the logged-in user.
 */
export const getMyReports = async (): Promise<WeeklyReportResponse[]> => {
  const response = await apiClient.get<WeeklyReportResponse[]>("/api/v1/reports/my-reports");
  return response.data;
};

/**
 * Fetches all reports with optional filters. (Manager only)
 * @param filters Optional filters for project and dates.
 */
export const getAllReports = async (filters?: ReportFilters): Promise<WeeklyReportResponse[]> => {
  const params = new URLSearchParams();
  if (filters?.project_id) params.append("project_id", filters.project_id.toString());
  if (filters?.start_date) params.append("start_date", filters.start_date);
  if (filters?.end_date) params.append("end_date", filters.end_date);

  const response = await apiClient.get<WeeklyReportResponse[]>("/api/v1/reports/", { params });
  return response.data;
};
