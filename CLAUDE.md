# Browser Brawl

Cat vs Mouse browser agent game — one AI agent (mouse) tries to complete a task on a webpage, another AI agent (cat) tries to block it.

## Tech Stack

- **Frontend/Viz:** Next.js + TypeScript
- **Browser Infrastructure:** Browserbase (cloud browser via CDP)
- **Backend/Agents:** TBD (Python or TypeScript)

## Browserbase Integration

- **SDK:** `@browserbasehq/sdk` (Node.js, v2.7+)
- **Purpose:** Provides a cloud browser session that both agents connect to via CDP
- **Environment Variables** (in `.env.local`, gitignored):
  - `BROWSERBASE_API_KEY` — API key (server-side only, never exposed to client)
  - `BROWSERBASE_PROJECT_ID` — project identifier for session creation
- **API Route:** `POST /api/browserbase/session` — creates a session and returns `{ sessionId, debuggerFullscreenUrl, connectUrl }`
- **Live View:** Embedded via iframe using `debuggerFullscreenUrl` from the session debug endpoint
- **Agent Connection:** Agents connect via `chromium.connectOverCDP(connectUrl)` (Playwright)
- **Docs:** https://docs.browserbase.com/features/session-live-view

## Architecture

### Core Components

1. **Orchestrator** — manages game state and turn flow
   - Initializes attacker (mouse) with goal + model, defender (cat) with model
   - State = DOM + screenshots
   - Calls `take_action(attacker)` then `take_action(defender)` each turn
   - Both models are parametrized by difficulty (e.g. "hard" = smarter model)

2. **Browser Controller** — updates the page
   - Receives actions from both agents and applies them to the DOM

3. **Mouse (Attacker)** — off-the-shelf browser agent
   - Options: Browser Use, Anthropic computer use, etc.
   - Given a single prompt with a goal (e.g. "add this item to cart", "book the cheapest flight")
   - Executes browser actions (click, type, scroll, etc.)

4. **Cat (Defender)** — custom agent that modifies the DOM to block the mouse
   - Injects DOM/CSS overlays, popups, moves elements, modifies components
   - Difficulty levels control: how much DOM changes, how many popups, whether it can erase mouse's work

5. **Visualization** — split-screen UI
   - Website in center
   - Attacker thoughts/actions on left, defender on right
   - Stream agent thinking, highlight DOM selections
   - Health bar for mouse (decreases with time + trap hits)

### Game Flow

- **Turn-based** (not real-time) for the simplest version
- Defender sets traps first, then attacker acts, then defender again
- Orchestrator handles sequencing and state

### Website Strategy

- **Shallow copy approach:** snapshot a real webpage's DOM (e.g. Amazon product page, checkout flow)
- Create a fake local version from the snapshot
- Predefine the goal/objective for that page
- Don't worry about generating multiple websites for now — start with one

## Defender Agent (Cat)

Standalone CLI prototype in `defender/src/`.

- **Entry:** `npm run defend -- "<url>" "<goal>"`
- **Script:** `node --import tsx/esm defender/src/index.ts`
- **Model:** `claude-sonnet-4-6` via `@anthropic-ai/sdk`
- **Browser control:** `@playwright/mcp` spawned as child process via `StdioClientTransport` (not a local dep — invoked via `npx @playwright/mcp@latest`)
- **MCP client:** `@modelcontextprotocol/sdk` — `Client` connects to Playwright MCP, fetches tools, converts `inputSchema` → `input_schema` for Anthropic API
- **Agentic loop:** Claude calls browser tools (`browser_navigate`, `browser_snapshot`, `browser_evaluate`) → results fed back → repeat until `end_turn` or 50 iterations
- **Main weapon:** `browser_evaluate` runs arbitrary JS in page context (like `page.evaluate()`) — injects overlays, fake buttons, CSS traps, event listeners
- **Env:** `ANTHROPIC_API_KEY` loaded from `.env.local` (code parses it directly, overrides shell env)
- **TypeScript:** Uses `tsconfig.defender.json` (`module: NodeNext`) separate from root Next.js tsconfig. Relative imports require `.js` extension.
- **Windows:** `npx.cmd` used instead of `npx` on `win32`

### Files
- `defender/src/index.ts` — CLI entrypoint, .env.local loader, arg validation
- `defender/src/defender-agent.ts` — MCP client setup, schema conversion, system prompt, agent loop
- `tsconfig.defender.json` — NodeNext config for Node.js CLI

## Open Design Questions

- Live website vs shallow copy (leaning shallow copy for v1)
- Turn-based vs real-time (starting turn-based)
- What rules/constraints govern the defender's modifications
- Exact mechanism for how defender modifies DOM
- Trace storage: Supabase? Existing tracing platform?
