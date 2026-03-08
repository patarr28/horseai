import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

let mcpClient: Client | null = null;

/**
 * Returns a connected MCP client for The Racing API.
 * Uses StreamableHTTP transport with API key auth headers.
 * The client is cached as a singleton for the lifetime of the server process.
 */
export async function getRacingMcpClient(): Promise<Client> {
    if (mcpClient) {
        return mcpClient;
    }

    const headers: Record<string, string> = {
        "X-RacingAPI-Username": process.env.RACING_API_USER || "",
        "X-RacingAPI-Password": process.env.RACING_API_PASS || "",
    };

    const transport = new StreamableHTTPClientTransport(
        new URL("https://mcp.theracingapi.com/"),
        {
            requestInit: { headers },
        }
    );

    const client = new Client(
        { name: "Festival-Whisperer", version: "1.0.0" },
        { capabilities: {} }
    );

    await client.connect(transport);
    mcpClient = client;
    console.log("[MCP] Connected to The Racing API");

    return mcpClient;
}

/**
 * Calls a specific tool on The Racing API MCP server.
 * @param toolName - The name of the tool to call (e.g. "get_racecards_free")
 * @param args - The arguments object for the tool
 * @returns The tool result content
 */
export async function callRacingTool(toolName: string, args: Record<string, unknown> = {}) {
    const client = await getRacingMcpClient();
    const result = await client.callTool({ name: toolName, arguments: args });
    return result;
}
