# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bun monorepo for multi-modal AI image generation experiments. Organized by provider (openai, google) with sub-packages for different modalities (image).

## Commands

```bash
# Install dependencies (from root)
bun install

# Run a specific package
bun run openai/image/index.ts
bun run google/image/index.ts

# Run tests
bun test
```

## Architecture

```
hello-gen-image/
├── openai/
│   └── image/          # OpenAI gpt-image-1.5 API integration
│       └── index.ts    # Image editing with prompt from input/prompt.txt
├── google/
│   └── image/          # Google/Gemini image generation (placeholder)
└── package.json        # Workspace root
```

## Bun Runtime

- Use `bun <file>` instead of `node`
- Use `bun install` instead of npm/yarn/pnpm
- Bun automatically loads `.env` files
- Prefer `Bun.file` over `node:fs` readFile/writeFile
- Use `bun test` with `import { test, expect } from "bun:test"`

## Environment Variables

- `OPENAI_API_KEY` - Required for OpenAI image generation
- `GOOGLE_API_KEY` - Required for Google Gemini image generation
