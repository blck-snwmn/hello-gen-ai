# Google Veo Video Generation

Generate videos using Google's veo-3.1-generate-preview model.

## Setup

```bash
bun install
```

Set your API key in `.env`:

```
GOOGLE_API_KEY=your-api-key
```

## Usage

Place your prompt in `input/prompt.txt`, then run:

```bash
bun run index.ts
```

Output MP4 files are saved to `output/` directory.
