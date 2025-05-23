# playwright
Code generation, replay, and debugging

# Getting started
1. Have node installed: https://nodejs.org/en/download/
2. Download code and `npm i`
3. `npx playwright install`
4. Launch the DEBUGGER-START command file (modify the path if needed) - To launch the persistent browser
5. Have VS Code extension for Playwright installed (https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) and debug/play the test at the code level. Or... `npx playwright test` to run from command line.

# Resources
1. The post that helped me get this working: https://github.com/microsoft/playwright/issues/11442
2. https://playwright.dev/docs/getting-started-vscode
3. https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright
4. https://chromewebstore.google.com/detail/playwright-chrome-recorde/bfnbgoehgplaehdceponclakmhlgjlpd?pli=1
5. https://github.com/tmahesh/playwright-agent

# Prompting
lsof -ti:8931 | xargs kill -9
lsof -ti:3000 | xargs kill -9
npx @playwright/mcp@latest --port 8931 --cdp-endpoint http://localhost:9222
npx genkit start -- npx tsx --watch genkit.ts
