import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

type AxeFixture = {
  a11y: (selector?: string) => AxeBuilder;
};

export const test = base.extend<AxeFixture>({
  a11y: async ({ page }, use) => {
    await use((selector?: string) => {
      const builder = new AxeBuilder({ page }).withTags(wcagTags);
      return selector ? builder.include(selector) : builder;
    });
  },
});

export { expect } from '@playwright/test';
