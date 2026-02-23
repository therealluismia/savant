import { useEffect, useCallback } from 'react';
import { useProjectsStore } from '@/store';

export function useProjects() {
  const projects = useProjectsStore((s) => s.projects);
  const isLoading = useProjectsStore((s) => s.isLoading);
  const error = useProjectsStore((s) => s.error);
  const fetchProjects = useProjectsStore((s) => s.fetchProjects);
  const createProject = useProjectsStore((s) => s.createProject);
  const deleteProject = useProjectsStore((s) => s.deleteProject);
  const clearError = useProjectsStore((s) => s.clearError);
  const getStats = useProjectsStore((s) => s.getStats);

  const refresh = useCallback(() => {
    void fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (projects.length === 0) {
      void fetchProjects();
    }
  }, [fetchProjects, projects.length]);

  return {
    projects,
    isLoading,
    error,
    refresh,
    createProject,
    deleteProject,
    clearError,
    stats: getStats(),
  };
}
