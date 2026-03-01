# Browser-Use Cloud API: Research Report

## 1. API Versions

### V1 (Deprecated)
- Legacy API, EOL January 1, 2026
- Basic task endpoints

### V2 (Current Stable)
- Base URL: `https://api.browser-use.com/api/v2`
- Auth header: `X-Browser-Use-API-Key: <apiKey>`
- Comprehensive task and session management

### V3 (Experimental)
- SDK-based interface (not REST), `client.run()` method
- Cleaner API, native structured output with schemas, real-time step streaming
- Not yet production-ready

---

## 2. V2 API Endpoints

### Task Management

```
POST /api/v2/tasks
- Create and start a new task (auto-creates session if sessionId not specified)
- Body: {
    "task": "string (required, 1-50k chars)",
    "llm": "string (optional, default: gemini-3-flash-preview)",
    "sessionId": "UUID (optional)",
    "startUrl": "string (optional)",
    "maxSteps": "number (optional)",
    "metadata": "object (optional)",
    "secrets": "object (optional)",
    "vision": "boolean (optional)",
    "thinking": "boolean (optional)"
  }
- Response (202): { "id": "string", "sessionId": "string" }

GET /api/v2/tasks/{task_id}
- Full task details with steps, status, output, file references

GET /api/v2/tasks/{task_id}/status
- Lightweight polling: status, output, cost only

PATCH /api/v2/tasks/{task_id}?action=stop
- Stop a running task

GET /api/v2/tasks
- List all tasks (paginated)
- Query: pageSize, pageNumber, sessionId, filterBy, after, before
```

### Session Management

```
GET /api/v2/sessions/{sessionId}
- Retrieve session details (includes liveUrl)

PATCH /api/v2/sessions/{session_id}?action=stop
- Terminate session
```

### Browser Management (Raw CDP Access)

```
POST /api/v2/browsers
- Create raw browser session with CDP access
- Returns: { cdp_url: "ws://...", live_url: "https://..." }

GET /api/v2/browsers
- List active browser sessions
```

### Profiles

```
POST /api/v2/profiles
- Create browser profile (persists cookies, localStorage, passwords)

GET /api/v2/profiles
- List all profiles

GET /api/v2/profiles/{profile_id}
- Get specific profile
```

### Files

```
POST /api/v2/files/presigned-url
- Get presigned URL for file uploads/downloads
```

### Billing

```
GET /api/v2/billing/account
- Account credit balances and rate limits
```

---

## 3. CDP (Chrome DevTools Protocol) Access

browser-use provides raw CDP access via `/api/v2/browsers`:

```python
result = await client.browsers.create()
# Returns:
# {
#   "cdp_url": "ws://[host]/devtools/browser/[session-id]",
#   "live_url": "https://debug.browser-use.com/session/[id]"
# }
```

### JavaScript Injection via CDP

```python
# Using Runtime.evaluate (single execution)
result = await page.evaluate('() => document.title')

# Using Page.evaluateOnNewDocument (persists across navigations)
await page.evaluateOnNewDocument('''
    window.myCustomVariable = "injected";
''')
```

**Key limitation:** The v2 task API does NOT expose CDP URLs directly. You MUST use `/api/v2/browsers` to get raw CDP access.

---

## 4. Providing Your Own Browserbase Session

Yes, browser-use supports Browserbase as a browser provider:

```python
import browserbase
from browser_use import Agent
from browser_use.browser.base import BrowserManager

bb = browserbase.Browserbase(api_key="...")
bb_session = bb.sessions.create()

browser_manager = BrowserManager(
    browser_type="chrome",
    provider="browserbase",
    browserbase_connect_url=bb_session['connect_url']
)

agent = Agent(task="Your task", browser_manager=browser_manager)
result = await agent.run()
```

This is for the **Python library** (self-hosted), not the cloud API.

---

## 5. liveUrl Format

From task sessions:
```
https://live.browser-use.com?wss=https%3A%2F%2F{sessionId}.cdp0.browser-use.com
```

From `/api/v2/browsers`:
```
https://debug.browser-use.com/session/[id]
```

The `liveUrl` is NOT a CDP WebSocket URL. To get CDP, use the `/api/v2/browsers` endpoint which returns `cdp_url` directly.

---

## 6. Session Sharing & Multi-Agent

### Same Session Reuse

```python
session = await client.sessions.create(keep_alive=True)
task1 = await client.tasks.run(task="Login", session_id=session['id'])
task2 = await client.tasks.run(task="Add to cart", session_id=session['id'])
await client.sessions.stop(session['id'])
```

### Multiple Agents on Same Session

Supported but experimental. Agents can conflict. Not recommended for production.

### Session Persistence with Profiles

```python
profile = await client.profiles.create(name="my-account")
session1 = await client.sessions.create(profile_id=profile['id'])
# Login once...
# Later, new session with same profile = already logged in
session2 = await client.sessions.create(profile_id=profile['id'])
```

---

## 7. Version Comparison

| Feature | V1 | V2 | V3 |
|---------|----|----|-----|
| Status | Deprecated | Current Stable | Experimental |
| Interface | REST API | REST API | SDK (.run()) |
| Structured Output | Basic | Good | Native (schemas) |
| Session Management | Basic | Comprehensive | Streamlined |
| Production Ready | No | Yes | No (beta) |

---

## Key Takeaway for Browser Brawl

The `/api/v2/browsers` endpoint is the most useful: it creates a raw browser with CDP access AND a live view URL. This lets us:
1. Connect any agent (Anthropic computer-use, etc.) via CDP
2. Inject defender JS via the same CDP connection
3. Embed the `live_url` in an iframe for spectating
4. No Browserbase dependency needed
