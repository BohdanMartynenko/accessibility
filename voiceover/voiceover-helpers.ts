import { VoiceOverPlaywright } from '@guidepup/playwright';

const maxNavigationLoop = 10;

export function voiceOverDelay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function navigateUntilFound(
  voiceOver: VoiceOverPlaywright,
  text: string,
  command: () => Promise<void>,
) {
  let count = 0;

  while (count <= maxNavigationLoop) {
    count++;
    await command();
    await voiceOver.perform(voiceOver.keyboardCommands.describeItem);

    if ((await voiceOver.itemText()).includes(text)) {
      return;
    }
  }

  throw new Error(
    `Could not find "${text}" within ${maxNavigationLoop} steps`,
  );
}
