# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow Rules

- When adding a new package or modality, update root README.md, root CLAUDE.md, and create package-level README.md as part of the task.

## Project Overview

Bun monorepo for multi-modal AI experiments. Organized by provider (openai, google) with sub-packages for different modalities (image, transcription, tts).

## Commands

```bash
# Install dependencies (from root)
bun install

# Run a specific package
bun run openai/image/index.ts
bun run openai/transcription/index.ts
bun run openai/diarization/index.ts
bun run google/image/index.ts
bun run google/transcription/index.ts
bun run google/diarization/index.ts
bun run google/tts/index.ts

# Run tests
bun test
```

## Architecture

```
hello-gen-ai/
├── openai/
│   ├── image/            # OpenAI gpt-image-1.5 image editing
│   │   └── index.ts
│   ├── transcription/    # OpenAI Whisper speech-to-text (SRT)
│   │   └── index.ts
│   └── diarization/      # OpenAI gpt-4o-transcribe-diarize speaker diarization
│       └── index.ts
├── google/
│   ├── image/            # Gemini gemini-3-pro-image-preview image generation
│   │   └── index.ts
│   ├── transcription/    # Gemini gemini-3-flash-preview speech-to-text (SRT)
│   │   └── index.ts
│   ├── diarization/      # Gemini gemini-3-flash-preview speaker diarization
│   │   └── index.ts
│   └── tts/              # Gemini gemini-2.5-flash-preview-tts text-to-speech
│       └── index.ts
└── package.json          # Workspace root
```

## Bun Runtime

- Use `bun <file>` instead of `node`
- Use `bun install` instead of npm/yarn/pnpm
- Bun automatically loads `.env` files
- Prefer `Bun.file` over `node:fs` readFile/writeFile
- Use `bun test` with `import { test, expect } from "bun:test"`

## Environment Variables

- `OPENAI_API_KEY` - Required for OpenAI packages (image, transcription, diarization)
- `GOOGLE_API_KEY` - Required for Google Gemini packages (image, transcription, diarization, tts)
