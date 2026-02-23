import type { AuthUser } from '@/core/auth';

// ─── Project types ────────────────────────────────────────────────────────────

export type ProjectStatus = 'idle' | 'building' | 'success' | 'failed';

export interface MockProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
  lastBuildId: string | null;
}

// ─── Build log types ──────────────────────────────────────────────────────────

export type BuildLogLevel = 'info' | 'success' | 'warn' | 'error';

export interface BuildLogEntry {
  id: string;
  buildId: string;
  timestamp: string;
  level: BuildLogLevel;
  message: string;
}

// ─── Mock users ───────────────────────────────────────────────────────────────

export interface MockUserRecord {
  id: string;
  email: string;
  password: string;
  displayName: string;
}

export const MOCK_USERS: MockUserRecord[] = [
  {
    id: 'usr_01',
    email: 'alice@forgeai.dev',
    password: 'password123',
    displayName: 'Alice Chen',
  },
  {
    id: 'usr_02',
    email: 'bob@forgeai.dev',
    password: 'password123',
    displayName: 'Bob Martinez',
  },
  {
    id: 'usr_03',
    email: 'carol@forgeai.dev',
    password: 'password123',
    displayName: 'Carol Kim',
  },
];

export function findMockUser(email: string): MockUserRecord | undefined {
  return MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function toAuthUser(record: MockUserRecord): AuthUser {
  return { id: record.id, email: record.email };
}

// ─── Mock projects ────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: MockProject[] = [
  {
    id: 'proj_01',
    name: 'Neural Gateway',
    description: 'AI-powered API gateway with adaptive routing and load prediction.',
    createdAt: '2025-11-01T09:00:00Z',
    updatedAt: '2025-11-15T14:22:00Z',
    status: 'success',
    lastBuildId: 'build_01',
  },
  {
    id: 'proj_02',
    name: 'Forge CLI',
    description: 'Developer CLI toolchain for scaffolding ForgeAI projects.',
    createdAt: '2025-11-05T11:30:00Z',
    updatedAt: '2025-11-20T08:45:00Z',
    status: 'failed',
    lastBuildId: 'build_02',
  },
  {
    id: 'proj_03',
    name: 'DataPipeline Engine',
    description: 'Real-time data ingestion and transformation engine.',
    createdAt: '2025-11-10T16:00:00Z',
    updatedAt: '2025-11-21T11:00:00Z',
    status: 'idle',
    lastBuildId: null,
  },
  {
    id: 'proj_04',
    name: 'Canvas Studio',
    description: 'Visual workflow builder for AI model orchestration.',
    createdAt: '2025-11-12T10:00:00Z',
    updatedAt: '2025-11-22T09:30:00Z',
    status: 'success',
    lastBuildId: 'build_03',
  },
  {
    id: 'proj_05',
    name: 'Sentinel Monitor',
    description: 'Infrastructure health monitoring with AI anomaly detection.',
    createdAt: '2025-11-14T14:00:00Z',
    updatedAt: '2025-11-23T13:10:00Z',
    status: 'building',
    lastBuildId: 'build_04',
  },
  {
    id: 'proj_06',
    name: 'PromptVault',
    description: 'Version-controlled repository for LLM prompt management.',
    createdAt: '2025-11-16T08:00:00Z',
    updatedAt: '2025-11-24T10:00:00Z',
    status: 'success',
    lastBuildId: 'build_05',
  },
  {
    id: 'proj_07',
    name: 'EmbedCore',
    description: 'High-performance vector embedding service with caching layer.',
    createdAt: '2025-11-18T13:00:00Z',
    updatedAt: '2025-11-25T07:55:00Z',
    status: 'idle',
    lastBuildId: null,
  },
  {
    id: 'proj_08',
    name: 'AgentRunner',
    description: 'Autonomous AI agent execution environment with sandboxing.',
    createdAt: '2025-11-20T09:00:00Z',
    updatedAt: '2025-11-25T15:40:00Z',
    status: 'failed',
    lastBuildId: 'build_06',
  },
];

// ─── Sample build logs ────────────────────────────────────────────────────────

export const MOCK_BUILD_LOG_TEMPLATES: Array<
  Omit<BuildLogEntry, 'id' | 'buildId' | 'timestamp'>
> = [
  { level: 'info', message: 'Initializing build environment...' },
  { level: 'info', message: 'Resolving dependencies from lockfile...' },
  { level: 'info', message: 'Installing packages (42 packages)...' },
  { level: 'info', message: 'Running pre-build hooks...' },
  { level: 'info', message: 'Compiling TypeScript sources...' },
  { level: 'info', message: 'Bundling modules with esbuild...' },
  { level: 'info', message: 'Running unit test suite...' },
  { level: 'info', message: 'Tests: 48 passed, 0 failed.' },
  { level: 'info', message: 'Linting source files...' },
  { level: 'info', message: 'No lint errors found.' },
  { level: 'info', message: 'Generating build artifacts...' },
  { level: 'info', message: 'Optimizing bundle size...' },
  { level: 'info', message: 'Bundle size: 2.4 MB (gzipped: 680 KB)' },
  { level: 'info', message: 'Pushing image to registry...' },
  { level: 'info', message: 'Tagging release v1.0.0...' },
  { level: 'warn', message: 'Deprecated API usage detected in auth.service.ts:42' },
  { level: 'info', message: 'Running smoke tests against staging...' },
  { level: 'info', message: 'Smoke tests passed.' },
  { level: 'success', message: 'Build completed successfully in 47s.' },
];

export const MOCK_FAILURE_LOG_TEMPLATES: Array<
  Omit<BuildLogEntry, 'id' | 'buildId' | 'timestamp'>
> = [
  { level: 'info', message: 'Initializing build environment...' },
  { level: 'info', message: 'Resolving dependencies from lockfile...' },
  { level: 'info', message: 'Installing packages (42 packages)...' },
  { level: 'info', message: 'Running pre-build hooks...' },
  { level: 'info', message: 'Compiling TypeScript sources...' },
  { level: 'error', message: "Type error: Property 'id' does not exist on type 'RequestBody'." },
  {
    level: 'error',
    message: 'src/api/handler.ts:87:12 — Argument of type string is not assignable to number.',
  },
  { level: 'warn', message: '2 errors found. Aborting compilation.' },
  { level: 'error', message: 'Build failed. Exit code 1.' },
];
