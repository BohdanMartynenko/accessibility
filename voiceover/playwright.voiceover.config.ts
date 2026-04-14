import { defineConfig, devices } from '@playwright/test';
import { screenReaderConfig } from '@guidepup/playwright';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({
  path: [path.resolve(__dirname, '.env')],
});

export default defineConfig({
  ...screenReaderConfig,
  testDir: './tests/voiceover',
  outputDir: './test-results',
  reportSlowTests: null,
  timeout: 5 * 60 * 1000,
  retries: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  projects: [
    {
      name: 'VoiceOver: auth setup',
      testMatch: /auth\.setup\.ts/,
      testDir: './tests/setup',
      use: {
        baseURL: process.env.BASE_URL,
      },
    },
    {
      name: 'VoiceOver',
      use: {
        ...devices['Desktop Safari'],
        headless: false,
        baseURL: process.env.BASE_URL,
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['VoiceOver: auth setup'],
    },
  ],
});
