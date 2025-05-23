import { CommonFlows } from "./CommonFlows";
import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import My from "./My";

class LLMFlows extends CommonFlows {

  static async addKillPortsPromise(cleanupPromises, source = 'kill', ports = [8931, 4000, 3000]) {
    // Add cleanup function to kill all ports used for playwright-mcp
    for (let port of ports) {
      cleanupPromises.push(new Promise<void>((resolve) => {
        // Use a more portable approach that works in both local and CI environments
        // Previously, was exec(`lsof -ti:${port} | xargs kill -9`, which didn't work in CI
        // Instead of using lsof, we now use netstat which is more commonly available across different environments
        const command = process.platform === 'win32'
          ? `netstat -ano | findstr :${port} | findstr LISTENING | awk '{print $5}' | xargs -I {} taskkill /F /PID {}`
          : `(netstat -tulpn 2>/dev/null | grep :${port} | awk '{print $7}' | cut -d'/' -f1 | xargs -r kill -9) || true`;

        exec(command,
          async (error, stdout, stderr) => {
            // TODO: Remove hard-coded sleep. Need it to wait for things to be started completely
            await new Promise(resolve => setTimeout(resolve, 3000));

            if (error) {
              console.log(`${source}: Error killing port ${port}:`, error);
              resolve();
              return;
            }
            if (stderr) {
              console.log(`${source}: stderr:`, stderr);
              resolve();
              return;
            }
            console.log(`${source}: Successfully killed port ${port}`);
            resolve();
          });
      }));
    }
  }

  static async shouldKillAndClean(app, source, resolve, reject, data, ports = [8931, 4000, 3000]) {
    let shouldKill = false
    const dataStr = `source: ${source}: ${data}`
    console.log(dataStr);

    // Enhanced error detection for port conflicts
    if (data?.includes('EADDRINUSE') ||
      data?.includes('address already') ||
      data?.includes('listen EADDRINUSE') ||
      source.includes('stderror') ||
      source.includes('kill')) {
      shouldKill = true
      console.log('Detected port conflict, initiating cleanup...');
    }

    if (!shouldKill) return;

    try {
      if (app) {
        app.kill();
      }
      const cleanupPromises = []
      await LLMFlows.addKillPortsPromise(cleanupPromises, source, ports)
      await Promise.all(cleanupPromises)

      // Add a small delay to ensure ports are fully released
      // TODO: Remove hard-coded sleep
      await new Promise(resolve => setTimeout(resolve, 3000));

      if (source.includes('exit')) {
        resolve?.(data);
      } else {
        reject?.(data);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      reject?.(data);
    }
  }

  static launchMCP = async () => {
    await My.LLM.shouldKillAndClean(undefined, "mcp kill", undefined, undefined, undefined, [8931])
    return new Promise<void>((resolve, reject) => {
      // CDP endpoint needs to be a complete URL. When you just specify 9222, it tries to connect to port 80 (the default HTTP port) instead of port 9222
      // I've changed the CDP endpoint from https://localhost:9222 to http://localhost:9222. This should resolve the TLS connection issue since:
      // The Chrome DevTools Protocol server on localhost typically runs over HTTP, not HTTPS
      // The error you were seeing about the socket disconnecting before establishing a secure TLS connection indicates that the HTTPS protocol was causing the connection to fail
      const mcp = spawn('npx', ['@playwright/mcp@latest', '--port', '8931', '--cdp-endpoint', 'http://localhost:9222'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      });

      // Debug retry failing due to existing ports
      //  const retry = My.TestInfo.info().retry
      // if (retry === 0) {
      //   throw new Error('MCP is not running');
      // }

      mcp.stdout.on('data', async (data) => {
        await My.LLM.shouldKillAndClean(mcp, 'mcp stdout', resolve, reject, data.toString())
      });

      mcp.stderr.on('data', async (data) => {
        await My.LLM.shouldKillAndClean(mcp, 'mcp stderr', resolve, reject, data.toString())
      });

      mcp.on('error', async (data) => {
        await My.LLM.shouldKillAndClean(mcp, 'mcp stderror', resolve, reject, data.toString())
      });

      // Give it a moment to start up
      setTimeout(resolve, 5000);
    });
  };

  static launchTSX = async (directoryPath?: string) => {
    await My.LLM.shouldKillAndClean(undefined, "tsx kill", undefined, undefined, undefined, [3000])
    return new Promise<void>((resolve, reject) => {
      if (!directoryPath) {
        directoryPath = path.resolve(__dirname, '..', 'tests-agent')
      }

      // If path exists, check if it's a file or directory
      if (directoryPath) {
        try {
          const stats = fs.statSync(directoryPath);
          if (stats.isFile()) {
            // If it's a file (from require.resolve), get its directory
            directoryPath = path.dirname(directoryPath);
          }
          // If it's a directory, use it as is
        } catch (error) {
          reject(new Error(`Invalid path: ${directoryPath}`));
          return;
        }
      }

      const tsx = spawn('npx', ['tsx', 'genkit.ts'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true,
        cwd: directoryPath
      });

      tsx.stdout.on('data', async (data) => {
        await My.LLM.shouldKillAndClean(tsx, 'tsx stdout', resolve, reject, data.toString())
      });

      tsx.stderr.on('data', async (data) => {
        await My.LLM.shouldKillAndClean(tsx, 'tsx stderr', resolve, reject, data.toString())
      });

      tsx.on('error', async (data) => {
        await My.LLM.shouldKillAndClean(tsx, 'tsx stderror', resolve, reject, data.toString())
      });

      // Give it a moment to start up
      setTimeout(resolve, 5000);
    });
  };

  static async runPrompt(page, input: string, options?) {
    if (!options) { options = {} }
    if (!options.port) { options.port = 3000 }
    if (!options.url) { options.url = `http://localhost:${options.port}` }
    if (options.maxWaitPerAction === undefined) { options.maxWaitPerAction = 30 }
    if (options.includePassedFailedInstruction === undefined) { options.includePassedFailedInstruction = true }
    if (options.includeCloseBrowserInstruction === undefined) { options.includeCloseBrowserInstruction = false }

    // console.log('DEBUG: runPrompt OPENAI_API_KEY: ', process.env.OPENAI_API_KEY);
    // console.log('DEBUG: runPrompt OPENAI_BASE_URL: ', process.env.OPENAI_BASE_URL);
    // console.log('DEBUG: runPrompt GOOGLE_GENAI_API_KEY: ', process.env.GOOGLE_GENAI_API_KEY);

    // TODO: Add this as an intruction when first launched, not every action run
    // Extra instructions
    input += `If something is not specified and there is a field that needs to be filled out, 
    try your best to fill fields out and leave no fields blank, unless otherwise specified above.
    Use Playwright MCP to interact with the browser and do not ask user for any input.`
    if (options.includePassedFailedInstruction) {
      input += `If successful, include at the end of the output "Passed Browser Agent Action". 
      Else, include at the end of the output "Failed Browser Agent Action".`
    }
    if (options.includeMaxWaitPerActionInstruction) {
      input += `Do not wait more than 30 seconds per action to let me know if "Passed Browser Agent Action" or "Failed Browser Agent Action".`
    }
    if (options.includeCloseBrowserInstruction) {
      input += `When done, close the browser.'`
    }

    input += `Important: Try to complete the actions using the browser and when done, 
    output the playwright code as an output, in two different formats`
    input += `Format 1: Output the playwright code equivalent following best practices, 
    in JavaScript, using robust selectors, to do the actions specified above.
    - Prioritize robust selectors in this order:
    1. data-test-id
    2. aria-label
    3. Unique text content
    4. CSS selectors`
    input += 'Format 2: Output a second playwright code equivalent, in JavaScript, ' +
      'using the best xpath, in format using `` and ""' +
      'to do the actions specified above.'

    // input replace all newlines with spaces
    input = input.replace(/\n/g, ' ');

    // Ensure URL is properly formatted with http:// or https://
    const baseUrl = options.url.startsWith('http') ? options.url : `http://${options.url}`;
    const url = `${baseUrl}/flow`;
    console.log('Input Prompt: ', input);
    const payload = {
      "data": input
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}`);
    }

    const jsonResult = JSON.stringify(json.result[json.result.length - 1], null, 2).replace(/\\n/g, '\n');
    console.log('runPrompt result:');
    console.log(jsonResult);
    console.log('\n');
    if ((json.result[json.result.length - 1].content[0].text).includes("Failed Browser Agent Action")) {
      throw new Error(`Failed Browser Agent Action`);
    }

    return json;
  }
}
export { LLMFlows }