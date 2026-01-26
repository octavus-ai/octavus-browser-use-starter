# Octavus Browser Use Starter

A minimal Next.js starter template for building **browser automation agents** with [Octavus](https://octavus.ai). This agent can navigate websites, click elements, fill forms, take screenshots, and extract information.

## Features

- **Browser Automation** - Navigate, click, fill forms, and interact with any website
- **Screenshots** - Capture and display page screenshots in the chat
- **Text Extraction** - Extract text content from pages or specific elements
- **HTML Analysis** - Get simplified HTML structure for understanding page layout
- **Session Persistence** - Browser state persists across tool calls within a session

## Quick Start

### 1. Clone and Install

```bash
# Clone this template
npx degit octavus-ai/octavus-browser-use-starter my-browser-agent
cd my-browser-agent

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and add your Octavus credentials:

```env
OCTAVUS_API_URL="https://api.octavus.ai"
OCTAVUS_API_KEY=your-api-key-here
OCTAVUS_AGENT_ID=your-agent-id-here
```

### 3. Sync Your Agent

Upload the browser agent to Octavus:

```bash
npm run agents:sync
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and try asking the agent to:

- "Go to example.com and tell me what you see"
- "Navigate to news.ycombinator.com and get the top 5 headlines"
- "Go to google.com and search for 'octavus ai'"

## Browser Tools

| Tool | Description |
|------|-------------|
| `browser-navigate` | Navigate to a URL |
| `browser-click` | Click an element by CSS selector |
| `browser-fill` | Fill a form field with text |
| `browser-screenshot` | Capture a screenshot of the page |
| `browser-get-text` | Extract text content from page/element |
| `browser-get-html` | Get HTML structure for analysis |

## Project Structure

```
├── agents/
│   └── browser-agent/
│       ├── prompts/
│       │   └── system.md         # Browser agent system prompt
│       └── protocol.yaml         # Agent protocol with browser tools
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── trigger/
│   │   │       └── route.ts      # Creates browser tools per session
│   │   └── chat/
│   │       └── [sessionId]/
│   │           └── page.tsx
│   └── lib/
│       └── agents/
│           ├── browser-agent.ts  # Playwright tool implementations
│           └── index.ts
└── package.json
```

## How It Works

1. **Session-based browsers** - Each chat session gets its own browser instance that persists across tool calls
2. **Tool handlers** - Browser tools are implemented using Playwright and execute on your server
3. **Screenshots** - Captured as base64 data URLs and returned in tool results
4. **Auto-cleanup** - Inactive browser sessions are cleaned up after 10 minutes

## Customization

### Adding More Browser Tools

Edit `src/lib/agents/browser-agent.ts` to add new tools:

```typescript
'browser-scroll': async (args) => {
  const { page } = await getBrowserSession(sessionId);
  await page.evaluate((y) => window.scrollBy(0, y), args.pixels);
  return { success: true };
},
```

Don't forget to add the tool definition in `agents/browser-agent/protocol.yaml`.

### Changing Browser Settings

Modify the browser launch options in `browser-agent.ts`:

```typescript
const browser = await chromium.launch({
  headless: false,  // Show browser window for debugging
  slowMo: 100,      // Slow down actions for visibility
});
```

### Using Different Browsers

Playwright supports Chromium, Firefox, and WebKit:

```typescript
import { firefox } from 'playwright';
const browser = await firefox.launch({ headless: true });
```

## Deployment Notes

When deploying to production:

1. **Playwright browsers** - Ensure Playwright browsers are installed in your deployment environment
2. **Memory** - Browser instances use significant memory; monitor and adjust session limits
3. **Timeouts** - Consider your serverless function timeout limits for long-running browser operations

For serverless deployments (Vercel, etc.), consider using a browser service like [Browserless](https://browserless.io) or running on a dedicated server.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OCTAVUS_API_URL` | No | Octavus API URL (default: https://api.octavus.ai) |
| `OCTAVUS_API_KEY` | Yes | Your Octavus API key |
| `OCTAVUS_AGENT_ID` | Yes | The agent ID for the browser agent |

## Learn More

- [Octavus Documentation](https://docs.octavus.ai)
- [Playwright Documentation](https://playwright.dev/docs/intro)

## License

MIT
