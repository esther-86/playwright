export interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

export class MCPClient {
  private postUrl: string | null = null;
  private messageId = 1;
  private pendingRequests = new Map<number, { resolve: (res: any) => void; reject: (err: any) => void }>();
  private abortController: AbortController | null = null;

  constructor(private baseUrl = 'http://localhost:8931') {}

  async connect(timeoutMs = 10000): Promise<void> {
    this.abortController = new AbortController();
    const sseUrl = `${this.baseUrl}/sse`;

    const response = await fetch(sseUrl, {
      headers: { Accept: 'text/event-stream' },
      signal: this.abortController.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Failed to connect to MCP SSE at ${sseUrl}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // Start listening in background
    void this.readSSEStream(reader, decoder);

    // Wait for initial endpoint event
    const start = Date.now();
    while (!this.postUrl && Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, 100));
    }

    if (!this.postUrl) {
      throw new Error(`MCP SSE connection timed out without endpoint`);
    }

    // Initialize MCP protocol
    await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'playwright-test', version: '1.0.0' },
    });

    // Send initialized notification
    await fetch(this.postUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
    });
  }

  private async readSSEStream(reader: ReadableStreamDefaultReader<Uint8Array>, decoder: TextDecoder) {
    let buffer = '';
    let currentEvent = 'message';
    let dataLines: string[] = [];

    const dispatchEvent = () => {
      if (dataLines.length === 0) return;
      const dataStr = dataLines.join('\n');

      if (currentEvent === 'endpoint') {
        this.postUrl = dataStr.startsWith('http') ? dataStr : `${this.baseUrl}${dataStr}`;
      } else {
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.id && this.pendingRequests.has(parsed.id)) {
            const request = this.pendingRequests.get(parsed.id)!;
            this.pendingRequests.delete(parsed.id);
            parsed.error
              ? request.reject(new Error(parsed.error.message || 'MCP Error'))
              : request.resolve(parsed.result);
          }
        } catch {
          // Ignore non-JSON messages from the server.
        }
      }

      currentEvent = 'message';
      dataLines = [];
    };

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') {
            dispatchEvent();
            continue;
          }
          if (line.startsWith('event: ')) {
            currentEvent = line.substring(7).trim();
          } else if (line.startsWith('data: ')) {
            dataLines.push(line.substring(6).trim());
          }
        }
      }
    } catch {
      // Stream closed
    }
  }

  private async sendRequest(method: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.postUrl) {
      throw new Error('MCPClient not connected');
    }
    const id = this.messageId++;
    const payload = { jsonrpc: '2.0', id, method, params };

    const promise = new Promise<any>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`MCP request '${method}' timed out`));
        }
      }, 30000);
    });

    const res = await fetch(this.postUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      this.pendingRequests.delete(id);
      throw new Error(`MCP POST failed: ${res.statusText}`);
    }

    return promise;
  }

  async listTools(): Promise<MCPTool[]> {
    const res = await this.sendRequest('tools/list', {});
    return res.tools || [];
  }

  async callTool(name: string, args: Record<string, any> = {}): Promise<any> {
    return await this.sendRequest('tools/call', { name, arguments: args });
  }

  disconnect() {
    this.abortController?.abort();
    for (const request of this.pendingRequests.values()) {
      request.reject(new Error('MCP client disconnected'));
    }
    this.pendingRequests.clear();
    this.abortController = null;
    this.postUrl = null;
  }
}
