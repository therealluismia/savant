import type { BuildLogEntry } from './mockData';
import { getBuildLogTemplates } from './mockProjectService';
import { mockProjectService } from './mockProjectService';

type BuildEventCallback = (entry: BuildLogEntry) => void;
type BuildCompleteCallback = (success: boolean) => void;

interface BuildSession {
  buildId: string;
  projectId: string;
  willSucceed: boolean;
  logQueue: BuildLogEntry[];
  currentIndex: number;
  timer: ReturnType<typeof setInterval> | null;
  onEntry: BuildEventCallback;
  onComplete: BuildCompleteCallback;
}

const LOG_EMIT_INTERVAL_MS = 500;

function generateBuildId(): string {
  return `build_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const activeSessions = new Map<string, BuildSession>();

export const mockBuildService = {
  /**
   * Start a simulated build for a project.
   * Returns the buildId immediately; log entries stream via callback.
   * Randomly succeeds or fails (70/30 split).
   */
  startBuild: (
    projectId: string,
    onEntry: BuildEventCallback,
    onComplete: BuildCompleteCallback,
  ): string => {
    // Stop any existing build for this project first.
    mockBuildService.stopBuild(projectId);

    const buildId = generateBuildId();
    const willSucceed = Math.random() > 0.3;
    const logQueue = getBuildLogTemplates(willSucceed);

    mockProjectService.updateStatus(projectId, 'building', buildId);

    const session: BuildSession = {
      buildId,
      projectId,
      willSucceed,
      logQueue,
      currentIndex: 0,
      timer: null,
      onEntry,
      onComplete,
    };

    session.timer = setInterval(() => {
      if (session.currentIndex >= session.logQueue.length) {
        mockBuildService.stopBuild(projectId);
        const finalStatus = session.willSucceed ? 'success' : 'failed';
        mockProjectService.updateStatus(projectId, finalStatus);
        session.onComplete(session.willSucceed);
        return;
      }

      const entry = session.logQueue[session.currentIndex];
      if (entry) {
        session.onEntry(entry);
      }
      session.currentIndex += 1;
    }, LOG_EMIT_INTERVAL_MS);

    activeSessions.set(projectId, session);
    return buildId;
  },

  stopBuild: (projectId: string): void => {
    const session = activeSessions.get(projectId);
    if (session?.timer) {
      clearInterval(session.timer);
    }
    activeSessions.delete(projectId);
  },

  isBuilding: (projectId: string): boolean => {
    return activeSessions.has(projectId);
  },
};
