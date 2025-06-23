import { Project } from '../types/project';

const STORAGE_KEY = 'roof_calculator_projects';

export const saveProject = (project: Project): void => {
  try {
    const projects = getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = { ...project, updatedAt: new Date() };
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving project:', error);
  }
};

export const getProjects = (): Project[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const projects = JSON.parse(stored);
    // Convert date strings back to Date objects
    return projects.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt)
    }));
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};

export const deleteProject = (id: string): void => {
  try {
    const projects = getProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error deleting project:', error);
  }
};

export const generateProjectId = (): string => {
  return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};