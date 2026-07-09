import apiClient from "./client";

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectCreate {
  name: string;
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
export const createProject = async (data: ProjectCreate): Promise<Project> => {
  const response = await apiClient.post<Project>("/api/v1/projects/", data);
  return response.data;
};
