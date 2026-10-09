import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/core.test.ts', 'tests/firebase.test.ts'], environment: 'jsdom', setupFiles: ['tests/setup.ts'] } });
