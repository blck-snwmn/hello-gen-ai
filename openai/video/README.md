# OpenAI Sora Video Generation

Generate videos using OpenAI's sora-2 model.

## Setup

```bash
bun install
```

Set your API key in `.env`:

```
OPENAI_API_KEY=your-api-key
```

## Usage

Place your prompt in `input/prompt.txt`, then run:

```bash
bun run index.ts
```

Output MP4 files are saved to `output/` directory.
