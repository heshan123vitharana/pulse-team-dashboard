import apiClient from "./client";

export interface Project {
  id: number;
  project_name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  users?: { id: number; name: string; email: string; role_id: number }[];
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

/**
 * Assigns a user to a project.
 */
export const assignUserToProject = async (projectId: number, userId: number): Promise<void> => {
  await apiClient.post(`/api/v1/projects/${projectId}/assign/${userId}`);
};

/**
 * Removes a user from a project.
 */
export const unassignUserFromProject = async (projectId: number, userId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/projects/${projectId}/assign/${userId}`);
};
