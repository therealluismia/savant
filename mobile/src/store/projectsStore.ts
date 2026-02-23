import { create } from 'zustand';
import { mockProjectService } from '@/mock/mockProjectService';
import { mockBuildService } from '@/mock/mockBuildService';
import type { MockProject, BuildLogEntry, ProjectStatus } from '@/mock/mockData';

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Hard cap on log entries per project kept in memory.
 * When exceeded the oldest entries are dropped to prevent unbounded growth
 * during long / repeated builds (stress test: 10 simultaneous builds).
 */
const MAX_LOG_ENTRIES = 500;

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
  /**
   * deleteProject — guards against deleting a project that is currently
   * building. Callers should check `activeBuilds[id]` first and either stop
   * the build or block the action.
   */
  deleteProject: (id: string) => Promise<void>;
  startBuild: (projectId: string) => void;
  stopBuild: (projectId: string) => void;
  /**
   * stopAllBuilds — stops every active build and resets all activeBuilds to
   * false. Called on logout and on AppState change to background.
   */
  stopAllBuilds: () => void;
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
    const state = get();

    // Guard: stop the build first if the project is currently building so the
    // setInterval doesn't fire callbacks for a project that no longer exists.
    if (state.activeBuilds[id]) {
      mockBuildService.stopBuild(id);
      set((s) => ({
        activeBuilds: { ...s.activeBuilds, [id]: false },
      }));
    }

    // Optimistic remove from UI immediately
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));

    try {
      await mockProjectService.delete(id);
    } catch {
      // Rollback on failure by re-fetching
      void get().fetchProjects();
    }
  },

  startBuild: (projectId: string): void => {
    // Idempotency guard — the store already tracks this; the service also
    // stops any existing session before starting. Both layers agree.
    const alreadyBuilding = get().activeBuilds[projectId];
    if (alreadyBuilding) return;

    // Mark active + reset logs for this project
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
        set((state) => {
          const current = state.buildLogs[projectId] ?? [];
          // Enforce memory cap: drop oldest when limit is hit
          const next =
            current.length >= MAX_LOG_ENTRIES
              ? [...current.slice(current.length - MAX_LOG_ENTRIES + 1), entry]
              : [...current, entry];
          return {
            buildLogs: { ...state.buildLogs, [projectId]: next },
          };
        });
      },
      (success: boolean) => {
        const finalStatus: ProjectStatus = success ? 'success' : 'failed';
        set((state) => ({
          activeBuilds: { ...state.activeBuilds, [projectId]: false },
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, status: finalStatus, updatedAt: new Date().toISOString() }
              : p,
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

  stopAllBuilds: (): void => {
    const { activeBuilds, projects } = get();

    // Stop every active build session
    Object.entries(activeBuilds).forEach(([projectId, active]) => {
      if (active) {
        mockBuildService.stopBuild(projectId);
      }
    });

    // Reset all active build flags and reset building projects to idle
    const resetActiveBuilds: Record<string, boolean> = {};
    Object.keys(activeBuilds).forEach((id) => {
      resetActiveBuilds[id] = false;
    });

    set({
      activeBuilds: resetActiveBuilds,
      projects: projects.map((p) =>
        p.status === 'building' ? { ...p, status: 'idle' as ProjectStatus } : p,
      ),
    });
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
