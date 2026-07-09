import apiClient from "./client";

export interface Project {
  id: number;
  project_name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectCreate {
  project_name: string;
  description: string;
}

/**
 * Fetches the list of all projects from the backend.
 */
export const getProjects = async (): Promise<Project[]> => {
  const response = await apiClient.get<Project[]>("/api/v1/projects/");
  return response.data;
};

/**
 * Creates a new project in the backend.
 * @param data The project details (name, description)
 */
export const createProject = async (data: Omit<Project, "id" | "createdAt">): Promise<Project> => {
  const response = await apiClient.post<Project>("/api/v1/projects/", data);
  return response.data;
};

/**
 * Updates an existing project.
 */
export const updateProject = async (id: number, data: Partial<Omit<Project, "id" | "createdAt">>): Promise<Project> => {
  const response = await apiClient.put<Project>(`/api/v1/projects/${id}`, data);
  return response.data;
};

/**
 * Deletes a project by ID.
 */
export const deleteProject = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/v1/projects/${id}`);
};
