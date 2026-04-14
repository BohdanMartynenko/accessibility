import { voiceOverTest as test } from '@guidepup/playwright';
import { expect } from '@playwright/test';
import { navigateUntilFound, voiceOverDelay } from './voiceover-helpers';

test.use({ voiceOverStartOptions: { capture: 'initial' } });

test.describe('Home page VoiceOver', { tag: ['@a11y', '@voiceover'] }, () => {
  test('can navigate heading, sidebar, and user menu', async ({ page, voiceOver }) => {
    await page.goto('/', { waitUntil: 'load' });
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
      'Dashboard',
      () => voiceOver.perform(voiceOver.keyboardCommands.findNextLink),
    );
    await navigateUntilFound(
      voiceOver,
      'Settings',
      () => voiceOver.perform(voiceOver.keyboardCommands.findNextLink),
    );

    // User menu
    await page.getByRole('button', { name: /user menu/i }).click();
    await page.getByRole('menuitem', { name: /profile/i }).waitFor();
    await voiceOverDelay();

    await navigateUntilFound(voiceOver, 'Profile', () => voiceOver.next());
    await navigateUntilFound(voiceOver, 'Log out', () => voiceOver.next());

    // All key elements were announced
    const spoken = (await voiceOver.spokenPhraseLog()).join(' ');
    expect(spoken).toContain('Welcome');
    expect(spoken).toContain('Dashboard');
    expect(spoken).toContain('Settings');
    expect(spoken).toContain('Profile');
    expect(spoken).toContain('Log out');
  });
});
