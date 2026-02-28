import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;
const MAX_ITERATIONS = 50;

function buildSystemPrompt(url: string, defenderGoal: string): string {
  return `You are the Cat — the Defender in the Browser Brawl game.

Your mission: ${defenderGoal}

You are operating on the page: ${url}

Your role is to obstruct a Mouse agent that will try to complete a task on this webpage.
You must make the Mouse's task as difficult as possible without breaking the page entirely.

Strategy and tools at your disposal:
1. First, use browser_navigate to open the target URL.
2. Use browser_snapshot to understand the current DOM structure and identify key elements.
3. Use browser_evaluate to inject JavaScript that:
   - Overlays fake buttons on top of real ones (position:fixed, high z-index)
   - Injects CSS that hides, moves, or disguises interactive elements
   - Creates misleading popups and modal dialogs
   - Adds event listeners that intercept and cancel clicks
   - Redirects action buttons to wrong destinations
   - Inserts fake form fields that capture user input
   - Changes button text to be confusing (e.g., "Click Here to Continue" → actually cancels)
   - Adds CAPTCHA-like obstacles that are never solvable
4. Be creative and persistent. After each injection, take a new snapshot to verify your traps are in place.
5. Layer multiple traps — a single obstacle is easy to bypass.

You are the Defender. Make this page a minefield.

Rules:
- Do NOT navigate away from the target URL permanently
- Do NOT crash the JavaScript runtime with syntax errors
- All your modifications should persist in the DOM

Begin by navigating to the URL, then deploy your traps.`;
}

function convertMcpToolsToAnthropicFormat(
  mcpTools: Awaited<ReturnType<Client["listTools"]>>["tools"]
): Anthropic.Tool[] {
  return mcpTools.map((tool) => ({
    name: tool.name,
    description: tool.description ?? "",
    input_schema: tool.inputSchema as Anthropic.Tool.InputSchema,
  }));
}

interface McpContentItem {
  type: string;
  text?: string;
}

function buildToolResultBlock(
  toolUseId: string,
  mcpResult: Awaited<ReturnType<Client["callTool"]>>
): Anthropic.ToolResultBlockParam {
  const contentArray = mcpResult.content as McpContentItem[];
  const textContent = contentArray
    .filter(
      (item): item is McpContentItem & { text: string } =>
        item.type === "text" && typeof item.text === "string"
    )
    .map((item) => ({ type: "text" as const, text: item.text }));

  const content =
    textContent.length > 0
      ? textContent
      : [{ type: "text" as const, text: "[Tool returned no output]" }];

  return {
    type: "tool_result",
    tool_use_id: toolUseId,
    content,
  };
}

async function createMcpClient(): Promise<{
  client: Client;
  transport: StdioClientTransport;
}> {
  const isWindows = process.platform === "win32";
  const npxCommand = isWindows ? "npx.cmd" : "npx";

  const transport = new StdioClientTransport({
    command: npxCommand,
    args: ["@playwright/mcp@latest"],
    env: process.env as Record<string, string>,
  });

  const client = new Client(
    { name: "browser-brawl-defender", version: "0.1.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log("[defender] MCP client connected to @playwright/mcp");

  return { client, transport };
}

async function runAgentLoop(
  anthropic: Anthropic,
  client: Client,
  anthropicTools: Anthropic.Tool[],
  systemPrompt: string
): Promise<void> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content:
        "Begin. Navigate to the target URL and deploy your defensive traps.",
    },
  ];

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    console.log(
      `\n[defender] ── Iteration ${iteration + 1}/${MAX_ITERATIONS} ──`
    );

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: anthropicTools,
      messages,
    });

    console.log(`[defender] stop_reason: ${response.stop_reason}`);

    // Print Claude's text and tool calls for visibility
    const toolUseBlocks: Anthropic.ToolUseBlock[] = [];
    for (const block of response.content) {
      if (block.type === "text" && block.text.trim()) {
        console.log(`[claude] ${block.text}`);
      } else if (block.type === "tool_use") {
        console.log(
          `[tool_call] ${block.name}(${JSON.stringify(block.input).slice(0, 200)})`
        );
        toolUseBlocks.push(block);
      }
    }

    // Append Claude's response to conversation history
    messages.push({ role: "assistant", content: response.content });

    // If no tool calls, we're done
    if (toolUseBlocks.length === 0) {
      console.log(
        `[defender] No tool calls (stop_reason: ${response.stop_reason}). Done.`
      );
      break;
    }

    // Execute each tool call and collect results
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const toolUse of toolUseBlocks) {
      console.log(`[defender] Executing: ${toolUse.name}`);
      try {
        const mcpResult = await client.callTool({
          name: toolUse.name,
          arguments: toolUse.input as Record<string, unknown>,
        });
        const resultBlock = buildToolResultBlock(toolUse.id, mcpResult);

        const preview =
          resultBlock.content && Array.isArray(resultBlock.content)
            ? (resultBlock.content[0] as { text: string })?.text?.slice(0, 200) ?? ""
            : "";
        console.log(
          `[tool_result] ${toolUse.name}: ${preview}${preview.length >= 200 ? "..." : ""}`
        );

        toolResults.push(resultBlock);
      } catch (err) {
        console.error(`[defender] Tool error (${toolUse.name}):`, err);
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: [
            {
              type: "text",
              text: `Tool execution failed: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        });
      }
    }

    // Feed all tool results back as a single user turn
    messages.push({ role: "user", content: toolResults });
  }

  console.log("[defender] Agent loop complete.");
}

export async function runDefender(
  url: string,
  defenderGoal: string,
  apiKey: string
): Promise<void> {
  const anthropic = new Anthropic({ apiKey });
  const systemPrompt = buildSystemPrompt(url, defenderGoal);
  const { client, transport } = await createMcpClient();

  try {
    const { tools: mcpTools } = await client.listTools();
    const anthropicTools = convertMcpToolsToAnthropicFormat(mcpTools);

    console.log(
      `[defender] Available tools (${anthropicTools.length}):`,
      anthropicTools.map((t) => t.name).join(", ")
    );

    await runAgentLoop(anthropic, client, anthropicTools, systemPrompt);
  } finally {
    console.log("[defender] Closing MCP transport...");
    await transport.close();
    console.log("[defender] Transport closed.");
  }
}
