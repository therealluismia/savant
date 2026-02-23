import type { MockProject, BuildLogEntry, BuildLogLevel } from './mockData';
import {
  MOCK_PROJECTS,
  MOCK_BUILD_LOG_TEMPLATES,
  MOCK_FAILURE_LOG_TEMPLATES,
} from './mockData';
import { simulateLatency } from './latencySimulator';

// ─── In-memory state ──────────────────────────────────────────────────────────

let projects: MockProject[] = MOCK_PROJECTS.map((p) => ({ ...p }));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function now(): string {
  return new Date().toISOString();
}

// ─── Project CRUD ─────────────────────────────────────────────────────────────

export const mockProjectService = {
  list: async (): Promise<MockProject[]> => {
    const result = await simulateLatency([...projects]);
    return result;
  },

  getById: async (id: string): Promise<MockProject> => {
    const project = projects.find((p) => p.id === id);
    if (!project) {
      throw new Error(`Project "${id}" not found.`);
    }
    return simulateLatency({ ...project }, 300);
  },

  create: async (
    payload: Pick<MockProject, 'name' | 'description'>,
  ): Promise<MockProject> => {
    const newProject: MockProject = {
      id: generateId('proj'),
      name: payload.name,
      description: payload.description,
      createdAt: now(),
      updatedAt: now(),
      status: 'idle',
      lastBuildId: null,
    };
    await simulateLatency(null, 700);
    projects = [newProject, ...projects];
    return { ...newProject };
  },

  updateStatus: (id: string, status: MockProject['status'], buildId?: string): void => {
    projects = projects.map((p) =>
      p.id === id
        ? {
            ...p,
            status,
            updatedAt: now(),
            lastBuildId: buildId ?? p.lastBuildId,
          }
        : p,
    );
  },

  delete: async (id: string): Promise<void> => {
    await simulateLatency(null, 400);
    projects = projects.filter((p) => p.id !== id);
  },
};

// ─── Build log generation (used by mockBuildService) ─────────────────────────

function makeBuildLogEntry(
  template: Omit<BuildLogEntry, 'id' | 'buildId' | 'timestamp'>,
  buildId: string,
): BuildLogEntry {
  return {
    id: generateId('log'),
    buildId,
    timestamp: now(),
    level: template.level as BuildLogLevel,
    message: template.message,
  };
}

export function getBuildLogTemplates(willSucceed: boolean): BuildLogEntry[] {
  const templates = willSucceed ? MOCK_BUILD_LOG_TEMPLATES : MOCK_FAILURE_LOG_TEMPLATES;
  const buildId = generateId('build');
  return templates.map((t) => makeBuildLogEntry(t, buildId));
}
