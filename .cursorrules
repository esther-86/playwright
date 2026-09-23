# Agent Communication & Build Rules

## 1. Communication Style
- **Strictly ONE concept at a time**: Never explain multiple ideas, steps, or components in a single response.
- **Bite-sized format**: Keep explanations concise (2–4 sentences or one small snippet).
- **Interactive pacing**: Always pause and check for user understanding before moving to the next concept.
- **Ask 1 question at a time**: If clarifying or soliciting input, ask strictly one question at a time.
- **No walls of text**: Avoid overwhelming multi-step overviews unless explicitly requested.

## 2. Daily Logging & Redaction Standard
- **Per-day log file**: Whenever building features, log structured execution events to `logs/YYYY-MM-DD.log`.
- **PII & credential redaction**: Automatically redact passwords, API keys, tokens, emails, and card numbers.
- **Agent diagnostics**: Logs must contain enough context (timestamps, action, target selector, URL, duration, stack traces) for an AI agent to diagnose where the execution was stuck or errored.

## 3. Playwright Best Practices
- **No hardcoded sleeps/timeouts**: Never use `page.waitForTimeout()` or arbitrary `setTimeout`. Rely strictly on Playwright's built-in auto-waiting and web-first assertions (`expect(locator).toBeVisible()`, `expect(locator).toHaveText()`).
- **Resilient locators**: Prioritize user-facing accessibility locators (`page.getByRole()`, `page.getByText()`, `page.getByLabel()`) over fragile CSS classes or XPath.
- **Explicit state & network waiting**: When waiting for async reactions, use targeted conditions like `page.waitForResponse()`, `page.waitForURL()`, or locator state transitions instead of arbitrary delays.
- **Isolated test contexts**: Always execute tests in clean-room browser contexts (`browser.newContext()`) with independent storage and cookies to prevent state bleeding.

## 4. Single Centralized Configuration Standard
- **Single Source of Truth**: All environment variables and configuration must be declared and accessed strictly through a centralized configuration module.
- **No Duplicate Config Readers**: Never add ad-hoc config readers, custom `.env` parsers, or duplicate configuration interfaces in feature files.
- **Consistent Consumption**: All runners, brains, observers, and explorers must import config directly from the centralized module.

## 5. Site-Agnostic Exploration & Testing Architecture
- **Zero Site-Specific & Language-Dependent Regexes**: Avoid hardcoding domain terms or site-specific action verbs in generic discovery/automation helpers. Logic should operate robustly across domains and languages.
- **DOM Structural Induction**: Detect repeated UI collections through DOM structural patterns rather than hardcoded framework classes.
- **Clean-Room Test Isolation**: Every test run must be clean and repeatable, avoiding reliance on pre-existing mutable browser tabs or leaked singleton state.
