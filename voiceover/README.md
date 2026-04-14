# VoiceOver Tests

Screen reader accessibility tests using [Guidepup Playwright](https://github.com/guidepup/guidepup-playwright).

## macOS Setup

### 1. Run automated setup

```bash
npx @guidepup/setup
```

### 2. Allow VoiceOver to be controlled with AppleScript

1. Open **VoiceOver Utility** (Spotlight -> "VoiceOver Utility")
2. Go to the **General** tab
3. Enable **"Allow VoiceOver to be controlled with AppleScript"**

### 3. Grant Accessibility permissions

**macOS 14+ (Sonoma):**

1. Open **System Settings -> Privacy & Security -> Accessibility**
2. Click **+** and add your terminal app (Terminal, iTerm2, VS Code, etc.)
3. Ensure the checkbox is enabled

**macOS 12-13 (Monterey/Ventura):**

1. Open **System Preferences -> Security & Privacy -> Privacy -> Accessibility**
2. Unlock via the padlock icon
3. Click **+** and add your terminal app
4. Ensure the checkbox is ticked

### 4. Supported macOS versions

| macOS         | Status        |
|---------------|---------------|
| Monterey (12) | Supported     |
| Ventura (13)  | Supported     |
| Sonoma (14)   | Supported     |
| Sequoia (15)  | Not supported |
| Tahoe (26)    | Not supported |

## Installation

```bash
npm install --save-dev @guidepup/playwright @guidepup/guidepup @playwright/test
```

## Running

```bash
npm run test:voiceover
```

## Key Patterns

- `navigateToWebContent()` — required, initializes VoiceOver phrase capture
- `describeItem` after each navigation — ensures VoiceOver registers the current item
- `voiceOverDelay()` — 500ms settle time after page load and web content navigation
- `capture: 'initial'` — captures VoiceOver output from start
- Assert on `spokenPhraseLog()` — real VoiceOver output, not DOM content
- One test per page — VoiceOver startup/teardown is ~10s, keep assertions in a single session
