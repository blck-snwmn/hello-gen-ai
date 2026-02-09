# Google Gemini Text-to-Speech

Generate speech audio using Google's gemini-2.5-flash-preview-tts model.

## Setup

```bash
bun install
```

Set your API key in `.env`:

```
GOOGLE_API_KEY=your-api-key
```

## Usage

Configure voice in `input/config.json` and place text in `input/text.txt`, then run:

```bash
bun run index.ts
```

Output WAV files are saved to `output/` directory.
