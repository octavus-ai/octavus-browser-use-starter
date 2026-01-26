/**
 * Browser Agent Configuration
 *
 * Implements browser automation tools using Playwright.
 * The browser instance persists across tool calls within a session.
 */

import { z } from 'zod';
import type { ToolHandlers } from '@octavus/server-sdk';
import { chromium, type Browser, type Page } from 'playwright';
import type { AgentConfig } from './types';

// =============================================================================
// Tool Argument Schemas
// =============================================================================

const navigateSchema = z.object({
  url: z.string(),
});

const clickSchema = z.object({
  selector: z.string(),
});

const fillSchema = z.object({
  selector: z.string(),
  value: z.string(),
});

const getTextSchema = z.object({
  selector: z.string().optional(),
});

const getHtmlSchema = z.object({
  selector: z.string().optional(),
});

// =============================================================================
// Browser Session Management
// =============================================================================

interface BrowserSession {
  browser: Browser;
  page: Page;
  lastActivity: number;
}

// Store browser sessions by session ID
const browserSessions = new Map<string, BrowserSession>();

// Clean up inactive sessions after 10 minutes
const SESSION_TIMEOUT_MS = 10 * 60 * 1000;

async function getBrowserSession(sessionId: string): Promise<BrowserSession> {
  let session = browserSessions.get(sessionId);

  // Check if existing session is still valid (browser and page not closed)
  if (session) {
    const browserClosed = !session.browser.isConnected();
    const pageClosed = session.page.isClosed();

    if (browserClosed || pageClosed) {
      console.log(
        `[Browser] Session ${sessionId} is invalid (browser closed: ${browserClosed}, page closed: ${pageClosed}), cleaning up...`
      );
      // Try to close browser if it's still connected
      if (!browserClosed) {
        await session.browser.close().catch(() => {});
      }
      browserSessions.delete(sessionId);
      session = undefined;
    }
  }

  if (!session) {
    console.log(`[Browser] Creating new browser session: ${sessionId}`);
    const browser = await chromium.launch({
      headless: false,
      // Use a larger viewport for better visibility
      args: ['--start-maximized'],
    });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });
    session = { browser, page, lastActivity: Date.now() };
    browserSessions.set(sessionId, session);
  }

  session.lastActivity = Date.now();
  return session;
}

// Cleanup old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of browserSessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
      console.log(`[Browser] Cleaning up inactive session: ${sessionId}`);
      session.browser.close().catch(console.error);
      browserSessions.delete(sessionId);
    }
  }
}, 60 * 1000);

// =============================================================================
// Helper Functions
// =============================================================================

interface PageElement {
  tag: string;
  text?: string;
  href?: string;
  type?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  id?: string;
  class?: string;
  ariaLabel?: string;
}

/**
 * Extract interactive elements and key content from the page.
 * Returns a structured representation instead of raw HTML.
 */
async function extractPageStructure(page: Page, selector?: string): Promise<{
  title: string;
  url: string;
  elements: PageElement[];
  headings: string[];
  links: { text: string; href: string }[];
  forms: { action?: string; inputs: PageElement[] }[];
}> {
  return await page.evaluate((sel) => {
    const root = sel ? document.querySelector(sel) : document.body;
    if (!root) return { title: '', url: '', elements: [], headings: [], links: [], forms: [] };

    const elements: PageElement[] = [];
    const headings: string[] = [];
    const links: { text: string; href: string }[] = [];
    const forms: { action?: string; inputs: PageElement[] }[] = [];

    // Extract headings
    root.querySelectorAll('h1, h2, h3').forEach((el) => {
      const text = el.textContent?.trim();
      if (text) headings.push(`${el.tagName}: ${text}`);
    });

    // Extract links (limit to first 50)
    let linkCount = 0;
    root.querySelectorAll('a[href]').forEach((el) => {
      if (linkCount >= 50) return;
      const text = el.textContent?.trim();
      const href = el.getAttribute('href');
      if (text && href && !href.startsWith('javascript:')) {
        links.push({ text: text.substring(0, 100), href });
        linkCount++;
      }
    });

    // Extract buttons
    root.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"]').forEach((el) => {
      const text = el.textContent?.trim() || el.getAttribute('value') || el.getAttribute('aria-label');
      if (text) {
        elements.push({
          tag: el.tagName.toLowerCase(),
          text: text.substring(0, 100),
          id: el.id || undefined,
          class: el.className?.toString().substring(0, 50) || undefined,
          ariaLabel: el.getAttribute('aria-label') || undefined,
        });
      }
    });

    // Extract form inputs
    root.querySelectorAll('input, textarea, select').forEach((el) => {
      const input = el as HTMLInputElement;
      const type = input.type || el.tagName.toLowerCase();
      if (type === 'hidden') return;

      elements.push({
        tag: el.tagName.toLowerCase(),
        type,
        name: input.name || undefined,
        placeholder: input.placeholder || undefined,
        id: el.id || undefined,
        ariaLabel: el.getAttribute('aria-label') || undefined,
      });
    });

    // Extract forms with their inputs
    root.querySelectorAll('form').forEach((form) => {
      const formInputs: PageElement[] = [];
      form.querySelectorAll('input, textarea, select').forEach((el) => {
        const input = el as HTMLInputElement;
        if (input.type === 'hidden') return;
        formInputs.push({
          tag: el.tagName.toLowerCase(),
          type: input.type || el.tagName.toLowerCase(),
          name: input.name || undefined,
          placeholder: input.placeholder || undefined,
          id: el.id || undefined,
        });
      });
      if (formInputs.length > 0) {
        forms.push({
          action: form.action || undefined,
          inputs: formInputs,
        });
      }
    });

    return {
      title: document.title,
      url: window.location.href,
      elements,
      headings,
      links,
      forms,
    };
  }, selector);
}

// =============================================================================
// Tool Handlers Factory
// =============================================================================

/**
 * Creates tool handlers with access to the session ID.
 * This is called per-request with the current session context.
 */
export function createBrowserTools(sessionId: string): ToolHandlers {
  return {
    /**
     * Navigate to a URL
     */
    'browser-navigate': async (args) => {
      const { url } = navigateSchema.parse(args);
      console.log('[browser-navigate]', { url });

      try {
        const { page } = await getBrowserSession(sessionId);
        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
        const title = await page.title();

        return {
          success: true,
          url: page.url(),
          title,
          status: response?.status() ?? null,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Navigation failed',
        };
      }
    },

    /**
     * Click an element
     */
    'browser-click': async (args) => {
      const { selector } = clickSchema.parse(args);
      console.log('[browser-click]', { selector });

      try {
        const { page } = await getBrowserSession(sessionId);
        await page.click(selector, { timeout: 10000 });

        // Wait a moment for any navigation or updates
        await page.waitForTimeout(500);

        return {
          success: true,
          selector,
          currentUrl: page.url(),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Click failed',
          selector,
        };
      }
    },

    /**
     * Fill a form field
     */
    'browser-fill': async (args) => {
      const { selector, value } = fillSchema.parse(args);
      console.log('[browser-fill]', { selector });

      try {
        const { page } = await getBrowserSession(sessionId);
        await page.fill(selector, value, { timeout: 10000 });

        return {
          success: true,
          selector,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Fill failed',
          selector,
        };
      }
    },

    /**
     * Extract text content from the page
     */
    'browser-get-text': async (args) => {
      const { selector } = getTextSchema.parse(args);
      console.log('[browser-get-text]', { selector });

      try {
        const { page } = await getBrowserSession(sessionId);

        let text: string;
        if (selector) {
          text = (await page.textContent(selector, { timeout: 10000 })) ?? '';
        } else {
          text = await page.evaluate(() => document.body.innerText);
        }

        // Trim and limit text length for LLM context
        text = text.trim();
        const maxLength = 5000;
        const truncated = text.length > maxLength;
        if (truncated) {
          text = text.substring(0, maxLength) + '...(truncated)';
        }

        return {
          success: true,
          text,
          truncated,
          selector: selector ?? 'body',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Text extraction failed',
          selector: selector ?? 'body',
        };
      }
    },

    /**
     * Get page structure - extracts interactive elements, links, forms, and headings
     */
    'browser-get-html': async (args) => {
      const { selector } = getHtmlSchema.parse(args);
      console.log('[browser-get-html]', { selector });

      try {
        const { page } = await getBrowserSession(sessionId);

        if (selector) {
          const element = await page.$(selector);
          if (!element) {
            return {
              success: false,
              error: `Element not found: ${selector}`,
              selector,
            };
          }
        }

        const structure = await extractPageStructure(page, selector);

        return {
          success: true,
          title: structure.title,
          url: structure.url,
          headings: structure.headings,
          links: structure.links.slice(0, 30), // Limit links
          buttons: structure.elements.filter((e) => e.tag === 'button' || e.text),
          inputs: structure.elements.filter((e) => e.tag === 'input' || e.tag === 'textarea' || e.tag === 'select'),
          forms: structure.forms,
          selector: selector ?? 'document',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Page structure extraction failed',
          selector: selector ?? 'document',
        };
      }
    },
  };
}

// =============================================================================
// Export Config
// =============================================================================

/**
 * Agent configuration for "browser-agent".
 *
 * Note: Tools are created dynamically per-request using createBrowserTools()
 * to maintain browser session state. See the trigger route for usage.
 */
export const browserAgentConfig: AgentConfig = {
  agentId: process.env.OCTAVUS_AGENT_ID ?? 'your-agent-id-here',
  tools: {}, // Tools are provided dynamically - see trigger route
};
