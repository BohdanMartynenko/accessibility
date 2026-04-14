import { voiceOverTest as test } from '@guidepup/playwright';
import { expect } from '@playwright/test';
import { navigateUntilFound, voiceOverDelay } from '../../fixtures/voiceover-helpers';

test.use({ voiceOverStartOptions: { capture: 'initial' } });

test.describe('Dashboard VoiceOver', { tag: ['@a11y', '@voiceover'] }, () => {
  test('can navigate page content and user menu', async ({ page, voiceOver }) => {
    await page.goto('/dashboard', { waitUntil: 'load' });
    await page.getByRole('heading', { name: /welcome/i }).waitFor();
    await voiceOverDelay();

    await voiceOver.navigateToWebContent();
    await voiceOverDelay();

    // Heading
    await navigateUntilFound(
      voiceOver,
      'Welcome',
      () => voiceOver.perform(voiceOver.keyboardCommands.findNextHeading),
    );

    // Sidebar links
    await navigateUntilFound(
      voiceOver,
      'Courses',
      () => voiceOver.perform(voiceOver.keyboardCommands.findNextLink),
    );
    await navigateUntilFound(
      voiceOver,
      'Settings',
      () => voiceOver.perform(voiceOver.keyboardCommands.findNextLink),
    );

    // Verify all key elements were announced
    const spoken = (await voiceOver.spokenPhraseLog()).join(' ');
    expect(spoken).toContain('Welcome');
    expect(spoken).toContain('Courses');
    expect(spoken).toContain('Settings');
  });
});
