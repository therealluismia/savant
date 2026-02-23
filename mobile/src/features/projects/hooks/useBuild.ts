import { useCallback } from 'react';
import { useProjectsStore } from '@/store';

export function useBuild(projectId: string) {
  const isBuilding = useProjectsStore((s) => Boolean(s.activeBuilds[projectId]));
  const logs = useProjectsStore((s) => s.buildLogs[projectId] ?? []);
  const startBuild = useProjectsStore((s) => s.startBuild);
  const stopBuild = useProjectsStore((s) => s.stopBuild);
  const clearLogs = useProjectsStore((s) => s.clearLogs);

  const start = useCallback(() => {
    startBuild(projectId);
  }, [startBuild, projectId]);

  const stop = useCallback(() => {
    stopBuild(projectId);
  }, [stopBuild, projectId]);

  const clear = useCallback(() => {
    clearLogs(projectId);
  }, [clearLogs, projectId]);

  return { isBuilding, logs, start, stop, clear };
}
