import { create } from 'zustand';
import { mockProjectService } from '@/mock/mockProjectService';
import { mockBuildService } from '@/mock/mockBuildService';
import type { MockProject, BuildLogEntry, ProjectStatus } from '@/mock/mockData';

// ─── Store shape ──────────────────────────────────────────────────────────────

interface ProjectsStore {
  // State
  projects: MockProject[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  buildLogs: Record<string, BuildLogEntry[]>;
  activeBuilds: Record<string, boolean>;

  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (payload: { name: string; description: string }) => Promise<MockProject>;
  deleteProject: (id: string) => Promise<void>;
  startBuild: (projectId: string) => void;
  stopBuild: (projectId: string) => void;
  clearLogs: (projectId: string) => void;
  clearError: () => void;

  // Selectors (exposed as methods for simple derivation)
  getProjectById: (id: string) => MockProject | undefined;
  getLogsForProject: (projectId: string) => BuildLogEntry[];
  getStats: () => { total: number; success: number; failed: number; building: number };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProjectsStore = create<ProjectsStore>((set, get) => ({
  projects: [],
  isLoading: false,
  isCreating: false,
  error: null,
  buildLogs: {},
  activeBuilds: {},

  fetchProjects: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const projects = await mockProjectService.list();
      set({ projects });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load projects.';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (payload): Promise<MockProject> => {
    set({ isCreating: true, error: null });
    try {
      const project = await mockProjectService.create(payload);
      // Optimistic: prepend immediately so the list updates without re-fetch
      set((state) => ({ projects: [project, ...state.projects] }));
      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project.';
      set({ error: message });
      throw err;
    } finally {
      set({ isCreating: false });
    }
  },

  deleteProject: async (id: string): Promise<void> => {
    // Optimistic remove
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
    try {
      await mockProjectService.delete(id);
    } catch {
      // Rollback on failure by re-fetching
      void get().fetchProjects();
    }
  },

  startBuild: (projectId: string): void => {
    const alreadyBuilding = get().activeBuilds[projectId];
    if (alreadyBuilding) return;

    // Mark active + clear previous logs for this project
    set((state) => ({
      activeBuilds: { ...state.activeBuilds, [projectId]: true },
      buildLogs: { ...state.buildLogs, [projectId]: [] },
    }));

    // Update project status optimistically
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, status: 'building' as ProjectStatus } : p,
      ),
    }));

    mockBuildService.startBuild(
      projectId,
      (entry: BuildLogEntry) => {
        set((state) => ({
          buildLogs: {
            ...state.buildLogs,
            [projectId]: [...(state.buildLogs[projectId] ?? []), entry],
          },
        }));
      },
      (success: boolean) => {
        const finalStatus: ProjectStatus = success ? 'success' : 'failed';
        set((state) => ({
          activeBuilds: { ...state.activeBuilds, [projectId]: false },
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, status: finalStatus, updatedAt: new Date().toISOString() } : p,
          ),
        }));
      },
    );
  },

  stopBuild: (projectId: string): void => {
    mockBuildService.stopBuild(projectId);
    set((state) => ({
      activeBuilds: { ...state.activeBuilds, [projectId]: false },
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, status: 'idle' as ProjectStatus } : p,
      ),
    }));
  },

  clearLogs: (projectId: string): void => {
    set((state) => ({
      buildLogs: { ...state.buildLogs, [projectId]: [] },
    }));
  },

  clearError: (): void => {
    set({ error: null });
  },

  // ─── Selectors ─────────────────────────────────────────────────────────────

  getProjectById: (id: string): MockProject | undefined => {
    return get().projects.find((p) => p.id === id);
  },

  getLogsForProject: (projectId: string): BuildLogEntry[] => {
    return get().buildLogs[projectId] ?? [];
  },

  getStats: () => {
    const { projects } = get();
    return {
      total: projects.length,
      success: projects.filter((p) => p.status === 'success').length,
      failed: projects.filter((p) => p.status === 'failed').length,
      building: projects.filter((p) => p.status === 'building').length,
    };
  },
}));
